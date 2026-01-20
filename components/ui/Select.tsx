import React from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    label?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
    onChange: (value: string) => void;
}

export default function Select({
    label,
    error,
    options,
    placeholder = 'Select an option',
    value,
    onChange,
    className = '',
    id,
    ...props
}: SelectProps) {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={selectId}
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    id={selectId}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`
            w-full px-4 py-2.5 pr-10 rounded-xl border-2 bg-white dark:bg-slate-900
            text-slate-900 dark:text-white
            appearance-none cursor-pointer
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                        }
            ${className}
          `}
                    {...props}
                >
                    <option value="" disabled>
                        {placeholder}
                    </option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </div>
            {error && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
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
