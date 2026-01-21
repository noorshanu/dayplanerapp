'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import TimeBlockBuilder, { TimeBlock } from '@/components/TimeBlockBuilder';

type DateOption = 'today' | 'tomorrow' | 'custom';

// Get local date in YYYY-MM-DD format
function getLocalDate(daysOffset: number = 0): string {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Format time as HH:MM AM/PM
function getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

export default function CreatePlanPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [dateOption, setDateOption] = useState<DateOption>('today');
    const [customDate, setCustomDate] = useState('');
    const [blocks, setBlocks] = useState<TimeBlock[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentTime, setCurrentTime] = useState('');

    // Update time every second
    useEffect(() => {
        setCurrentTime(getCurrentTime());
        const interval = setInterval(() => {
            setCurrentTime(getCurrentTime());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const getDateValue = (): string => {
        if (dateOption === 'today') {
            return getLocalDate(0);
        } else if (dateOption === 'tomorrow') {
            return getLocalDate(1);
        }
        return customDate;
    };

    const formatDateDisplay = (date: string): string => {
        if (!date) return '';
        const [year, month, day] = date.split('-').map(Number);
        const d = new Date(year, month - 1, day);
        return d.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Please enter a plan title');
            return;
        }

        const selectedDate = getDateValue();
        if (!selectedDate) {
            setError('Please select a date');
            return;
        }

        if (blocks.length === 0) {
            setError('Please add at least one time block');
            return;
        }

        setLoading(true);

        try {
            // Check if selected date is today to auto-activate
            const today = getLocalDate(0);
            const shouldAutoActivate = selectedDate === today;

            const response = await fetch('/api/plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    date: selectedDate,
                    active: shouldAutoActivate,
                    blocks: blocks.map((b) => ({
                        startTime: b.startTime,
                        endTime: b.endTime,
                        activity: b.activity,
                        topic: b.topic || null,
                    })),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to create plan');
                return;
            }

            router.push('/dashboard');
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const todayStr = getLocalDate(0);

    return (
        <div className="space-y-8 py-8">
            {/* Header with Time */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Create New Plan
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Build your daily routine by adding time blocks
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                        {currentTime}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDateDisplay(getLocalDate(0))}
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Plan Title & Date */}
                <Card className="mb-6">
                    <div className="space-y-6">
                        <Input
                            label="Plan Title"
                            placeholder="e.g., Morning Routine, Study Session"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        {/* Date Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                Plan Date
                            </label>

                            {/* Quick Date Options */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setDateOption('today')}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${dateOption === 'today'
                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    📅 Today
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDateOption('tomorrow')}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${dateOption === 'tomorrow'
                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    ⏭️ Tomorrow
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDateOption('custom')}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${dateOption === 'custom'
                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    📆 Pick Date
                                </button>
                            </div>

                            {/* Custom Date Picker */}
                            {dateOption === 'custom' && (
                                <input
                                    type="date"
                                    value={customDate}
                                    min={todayStr}
                                    onChange={(e) => setCustomDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                />
                            )}

                            {/* Selected Date Display */}
                            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <span>📍</span>
                                <span>
                                    {formatDateDisplay(getDateValue())}
                                    {dateOption === 'today' && (
                                        <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                                            Auto-activates
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Time Blocks */}
                <Card className="mb-6" padding="lg">
                    <TimeBlockBuilder blocks={blocks} onChange={setBlocks} />
                </Card>

                {/* Actions */}
                <div className="flex items-center justify-between gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" loading={loading}>
                        Create Plan ({blocks.length} blocks)
                    </Button>
                </div>
            </form>
        </div>
    );
}
