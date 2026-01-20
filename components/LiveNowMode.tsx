'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Button from '@/components/ui/Button';
import SmartSnooze from '@/components/SmartSnooze';

interface CurrentTask {
    id: string;
    activity: string;
    topic?: string | null;
    startTime: string;
    endTime: string;
    remainingMinutes: number;
    remainingFormatted: string;
    snoozeCount: number;
    status: string;
}

interface NextTask {
    id: string;
    activity: string;
    topic?: string | null;
    startTime: string;
    endTime: string;
}

interface LiveNowModeProps {
    realityMode?: boolean;
}

export default function LiveNowMode({ realityMode = false }: LiveNowModeProps) {
    const [currentTask, setCurrentTask] = useState<CurrentTask | null>(null);
    const [nextTask, setNextTask] = useState<NextTask | null>(null);
    const [currentTime, setCurrentTime] = useState('');
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);
    const [showSnooze, setShowSnooze] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    const fetchCurrentTask = useCallback(async () => {
        try {
            const response = await fetch('/api/tasks/current');
            const data = await response.json();

            if (response.ok) {
                setCurrentTask(data.currentTask);
                setNextTask(data.nextTask);
                setCurrentTime(data.currentTime || '');
            }
        } catch (error) {
            console.error('Failed to fetch current task:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCurrentTask();
        // Refresh every minute
        const interval = setInterval(fetchCurrentTask, 60000);
        return () => clearInterval(interval);
    }, [fetchCurrentTask]);

    const handleMarkDone = async () => {
        setMarking(true);
        try {
            const response = await fetch('/api/tasks/current', {
                method: 'POST',
            });
            const data = await response.json();

            if (response.ok) {
                setFeedback(`+${data.pointsEarned} points!`);
                setTimeout(() => {
                    setFeedback(null);
                    fetchCurrentTask();
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to mark task done:', error);
        } finally {
            setMarking(false);
        }
    };

    const handleSnooze = async (duration: number | 'next') => {
        try {
            const response = await fetch('/api/tasks/snooze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ duration }),
            });
            const data = await response.json();

            if (response.ok) {
                setFeedback(data.feedbackMessage || 'Task snoozed');
                setShowSnooze(false);
                setTimeout(() => {
                    setFeedback(null);
                    fetchCurrentTask();
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to snooze task:', error);
        }
    };

    const formatTime = (time: string): string => {
        const [hours, minutes] = time.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Feedback overlay
    if (feedback) {
        return (
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-8 text-center text-white">
                <div className="text-4xl mb-2">✅</div>
                <div className="text-2xl font-bold">{feedback}</div>
            </div>
        );
    }

    // No current task
    if (!currentTask) {
        return (
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">😌</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    No task right now
                </h3>
                {nextTask ? (
                    <div className="mt-4 p-4 bg-white dark:bg-slate-700 rounded-xl">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Up next</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{nextTask.activity}</p>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400">
                            {formatTime(nextTask.startTime)}
                        </p>
                    </div>
                ) : (
                    <p className="text-slate-500 dark:text-slate-400">
                        No more tasks scheduled for today
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* NOW Badge */}
            <div className="flex items-center justify-center gap-2 mb-6">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-lg font-bold text-green-600 dark:text-green-400 tracking-wider">
                    NOW
                </span>
            </div>

            {/* Current Task Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20">
                {/* Time */}
                <div className="text-center mb-4">
                    <div className="text-lg font-medium opacity-90">
                        {formatTime(currentTask.startTime)} – {formatTime(currentTask.endTime)}
                    </div>
                </div>

                {/* Task Name */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold mb-2">{currentTask.activity}</h2>
                    {currentTask.topic && (
                        <p className="text-lg opacity-80">📚 {currentTask.topic}</p>
                    )}
                </div>

                {/* Countdown */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl">
                        <span className="text-xl">⏳</span>
                        <span className="text-2xl font-bold">{currentTask.remainingFormatted}</span>
                        <span className="opacity-80">remaining</span>
                    </div>
                </div>

                {/* Snooze feedback */}
                {currentTask.snoozeCount > 0 && (
                    <div className="text-center mb-4 text-sm opacity-80">
                        👀 Snoozed {currentTask.snoozeCount} time{currentTask.snoozeCount > 1 ? 's' : ''}
                    </div>
                )}

                {/* Actions */}
                {!showSnooze ? (
                    <div className="flex gap-3">
                        <Button
                            onClick={handleMarkDone}
                            loading={marking}
                            className="flex-1 bg-white text-indigo-600 hover:bg-indigo-50"
                            disabled={currentTask.status === 'completed'}
                        >
                            {currentTask.status === 'completed' ? '✓ Done' : 'Mark as Done'}
                        </Button>
                        <button
                            onClick={() => setShowSnooze(true)}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                            disabled={currentTask.status === 'completed'}
                        >
                            Snooze
                        </button>
                    </div>
                ) : (
                    <SmartSnooze
                        onSnooze={handleSnooze}
                        onCancel={() => setShowSnooze(false)}
                        hasNextTask={!!nextTask}
                    />
                )}
            </div>

            {/* Next Task (if Reality Mode is off or just showing next) */}
            {nextTask && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-500">
                            ⏭️
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Coming up</p>
                            <p className="font-semibold text-slate-900 dark:text-white">
                                {nextTask.activity}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                {formatTime(nextTask.startTime)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Hide rest of schedule in Reality Mode */}
            {realityMode && (
                <p className="text-center text-sm text-slate-400 dark:text-slate-500 mt-4">
                    Reality Mode: Focus on what&apos;s now
                </p>
            )}
        </div>
    );
}
