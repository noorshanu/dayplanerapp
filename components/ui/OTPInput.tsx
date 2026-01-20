'use client';

import React, { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from 'react';

interface OTPInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
}

export default function OTPInput({
    length = 6,
    value,
    onChange,
    error,
    disabled = false,
}: OTPInputProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Focus first input on mount
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, inputValue: string) => {
        // Only accept digits
        const digit = inputValue.replace(/\D/g, '').slice(-1);

        const newValue = value.split('');
        newValue[index] = digit;
        const updatedValue = newValue.join('').slice(0, length);
        onChange(updatedValue);

        // Move to next input if digit was entered
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
            setActiveIndex(index + 1);
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (!value[index] && index > 0) {
                // Move to previous input if current is empty
                inputRefs.current[index - 1]?.focus();
                setActiveIndex(index - 1);
            } else {
                // Clear current input
                const newValue = value.split('');
                newValue[index] = '';
                onChange(newValue.join(''));
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
            setActiveIndex(index - 1);
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
            setActiveIndex(index + 1);
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        onChange(pastedData);

        // Focus the input after the pasted content
        const nextIndex = Math.min(pastedData.length, length - 1);
        inputRefs.current[nextIndex]?.focus();
        setActiveIndex(nextIndex);
    };

    const handleFocus = (index: number) => {
        setActiveIndex(index);
    };

    return (
        <div className="w-full">
            <div className="flex justify-center gap-2 sm:gap-3">
                {Array.from({ length }).map((_, index) => (
                    <input
                        key={index}
                        ref={(el) => {
                            inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={value[index] || ''}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        onFocus={() => handleFocus(index)}
                        disabled={disabled}
                        className={`
              w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold
              rounded-xl border-2 bg-white dark:bg-slate-900
              text-slate-900 dark:text-white
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                : activeIndex === index
                                    ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                                    : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                            }
              ${value[index] ? 'border-indigo-400' : ''}
            `}
                    />
                ))}
            </div>
            {error && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400 text-center flex items-center justify-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}
