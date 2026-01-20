'use client';

import React from 'react';

interface SmartSnoozeProps {
    onSnooze: (duration: number | 'next') => void;
    onCancel: () => void;
    hasNextTask: boolean;
}

export default function SmartSnooze({ onSnooze, onCancel, hasNextTask }: SmartSnoozeProps) {
    const snoozeOptions = [
        { duration: 10, label: '+10 min', icon: '⏰' },
        { duration: 30, label: '+30 min', icon: '🕐' },
    ];

    return (
        <div className="space-y-3">
            <p className="text-center text-sm opacity-80 mb-3">Snooze for...</p>

            <div className="grid grid-cols-2 gap-2">
                {snoozeOptions.map((option) => (
                    <button
                        key={option.duration}
                        onClick={() => onSnooze(option.duration)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                    >
                        <span>{option.icon}</span>
                        <span className="font-medium">{option.label}</span>
                    </button>
                ))}
            </div>

            {hasNextTask && (
                <button
                    onClick={() => onSnooze('next')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/20"
                >
                    <span>⏭️</span>
                    <span className="font-medium">After next task</span>
                </button>
            )}

            <button
                onClick={onCancel}
                className="w-full px-4 py-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
            >
                Cancel
            </button>
        </div>
    );
}
