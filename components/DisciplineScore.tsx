'use client';

import React, { useState, useEffect } from 'react';

interface Breakdown {
    percentage: number;
    completedOnTime: number;
    completedLate: number;
    missed: number;
    totalSnoozes: number;
}

interface DailyScore {
    date: string;
    score: number;
}

interface DisciplineData {
    today: {
        score: number;
        breakdown: Breakdown;
        feedback: { emoji: string; message: string };
    };
    weekly: {
        average: number;
        bestDay: string;
        dailyScores: DailyScore[];
    };
}

interface DisciplineScoreProps {
    compact?: boolean;
}

export default function DisciplineScore({ compact = false }: DisciplineScoreProps) {
    const [data, setData] = useState<DisciplineData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDisciplineData();
    }, []);

    const fetchDisciplineData = async () => {
        try {
            const response = await fetch('/api/discipline');
            const result = await response.json();

            if (response.ok) {
                setData(result);
            }
        } catch (error) {
            console.error('Failed to fetch discipline data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl h-32" />
        );
    }

    if (!data) {
        return null;
    }

    const { today, weekly } = data;
    const scoreColor =
        today.score >= 80
            ? 'text-green-500'
            : today.score >= 60
                ? 'text-yellow-500'
                : today.score >= 40
                    ? 'text-orange-500'
                    : 'text-red-500';

    const progressColor =
        today.score >= 80
            ? 'stroke-green-500'
            : today.score >= 60
                ? 'stroke-yellow-500'
                : today.score >= 40
                    ? 'stroke-orange-500'
                    : 'stroke-red-500';

    // Compact view for sidebar/header
    if (compact) {
        return (
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <div className="relative w-10 h-10">
                    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                        <circle
                            cx="18"
                            cy="18"
                            r="15"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-slate-200 dark:text-slate-700"
                        />
                        <circle
                            cx="18"
                            cy="18"
                            r="15"
                            fill="none"
                            strokeWidth="3"
                            strokeDasharray={`${today.score} 100`}
                            strokeLinecap="round"
                            className={progressColor}
                        />
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${scoreColor}`}>
                        {today.score}
                    </span>
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Discipline</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {today.feedback.emoji} {today.feedback.message}
                    </p>
                </div>
            </div>
        );
    }

    // Full view
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Discipline Score
            </h3>

            {/* Main Score Circle */}
            <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
                        <circle
                            cx="18"
                            cy="18"
                            r="15"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-slate-200 dark:text-slate-700"
                        />
                        <circle
                            cx="18"
                            cy="18"
                            r="15"
                            fill="none"
                            strokeWidth="2"
                            strokeDasharray={`${today.score} 100`}
                            strokeLinecap="round"
                            className={progressColor}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-bold ${scoreColor}`}>{today.score}%</span>
                        <span className="text-xs text-slate-500">Today</span>
                    </div>
                </div>
            </div>

            {/* Feedback */}
            <div className="text-center mb-6">
                <span className="text-2xl mr-2">{today.feedback.emoji}</span>
                <span className="text-slate-600 dark:text-slate-300">{today.feedback.message}</span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{weekly.average}%</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">This Week</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {weekly.bestDay ? weekly.bestDay.slice(0, 3) : '—'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Best Day</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {today.breakdown.completedOnTime}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">On Time</p>
                </div>
            </div>

            {/* Breakdown */}
            {(today.breakdown.missed > 0 || today.breakdown.totalSnoozes > 0) && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-center text-sm text-slate-500">
                    {today.breakdown.missed > 0 && (
                        <span className="mr-4">❌ {today.breakdown.missed} missed</span>
                    )}
                    {today.breakdown.totalSnoozes > 0 && (
                        <span>😴 {today.breakdown.totalSnoozes} snoozes</span>
                    )}
                </div>
            )}
        </div>
    );
}
