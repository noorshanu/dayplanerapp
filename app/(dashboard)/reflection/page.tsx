'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';

type Mood = 'great' | 'okay' | 'bad';

interface Reflection {
    id: string;
    date: string;
    mood: Mood;
    disciplineScore: number;
    tasksCompleted: number;
    tasksMissed: number;
    totalSnoozes: number;
}

const moodEmojis: Record<Mood, { emoji: string; label: string; color: string }> = {
    great: { emoji: '😄', label: 'Great', color: 'bg-green-100 text-green-700 border-green-200' },
    okay: { emoji: '😐', label: 'Okay', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    bad: { emoji: '😞', label: 'Bad', color: 'bg-red-100 text-red-700 border-red-200' },
};

export default function ReflectionPage() {
    const [reflections, setReflections] = useState<Reflection[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [todaySubmitted, setTodaySubmitted] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    useEffect(() => {
        fetchReflections();
    }, []);

    const fetchReflections = async () => {
        try {
            const response = await fetch('/api/reflection');
            const data = await response.json();

            if (response.ok) {
                setReflections(data.reflections);

                // Check if today's reflection exists
                const today = new Date().toISOString().slice(0, 10);
                if (data.reflections.some((r: Reflection) => r.date === today)) {
                    setTodaySubmitted(true);
                }
            }
        } catch (error) {
            console.error('Failed to fetch reflections:', error);
        } finally {
            setLoading(false);
        }
    };

    const submitReflection = async (mood: Mood) => {
        setSubmitting(true);
        try {
            const response = await fetch('/api/reflection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mood }),
            });

            if (response.ok) {
                setFeedback('Reflection saved!');
                setTodaySubmitted(true);
                fetchReflections();
                setTimeout(() => setFeedback(null), 2000);
            }
        } catch (error) {
            console.error('Failed to submit reflection:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

        if (dateStr === today) return 'Today';
        if (dateStr === yesterday) return 'Yesterday';

        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 py-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Daily Reflection
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                    30-second check-in at the end of each day
                </p>
            </div>

            {/* Feedback */}
            {feedback && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-center">
                    ✅ {feedback}
                </div>
            )}

            {/* Today's Reflection */}
            <Card>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    How was your day?
                </h2>

                {todaySubmitted ? (
                    <div className="text-center py-6">
                        <span className="text-4xl block mb-3">✅</span>
                        <p className="text-slate-600 dark:text-slate-400">
                            You&apos;ve already reflected today. See you tomorrow!
                        </p>
                    </div>
                ) : (
                    <div className="flex justify-center gap-4">
                        {(['great', 'okay', 'bad'] as Mood[]).map((mood) => (
                            <button
                                key={mood}
                                onClick={() => submitReflection(mood)}
                                disabled={submitting}
                                className={`
                  flex flex-col items-center gap-2 px-8 py-6 rounded-2xl border-2 transition-all duration-200
                  hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                  ${moodEmojis[mood].color}
                `}
                            >
                                <span className="text-4xl">{moodEmojis[mood].emoji}</span>
                                <span className="font-medium">{moodEmojis[mood].label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </Card>

            {/* Reflection History */}
            <Card>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    History
                </h2>

                {reflections.length === 0 ? (
                    <div className="text-center py-8">
                        <span className="text-4xl block mb-3">📚</span>
                        <p className="text-slate-500 dark:text-slate-400">
                            No reflections yet. Start today!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reflections.map((reflection) => (
                            <div
                                key={reflection.id}
                                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">{moodEmojis[reflection.mood].emoji}</span>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {formatDate(reflection.date)}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Score: {reflection.disciplineScore}% •
                                            {reflection.tasksCompleted} completed
                                            {reflection.tasksMissed > 0 && ` • ${reflection.tasksMissed} missed`}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`
                    inline-flex px-2 py-1 rounded-lg text-xs font-medium
                    ${moodEmojis[reflection.mood].color}
                  `}>
                                        {moodEmojis[reflection.mood].label}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Insight Card */}
            {reflections.length >= 3 && (
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-100 dark:border-indigo-800">
                    <div className="flex items-start gap-4">
                        <span className="text-2xl">💡</span>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                                Insight
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {getMoodInsight(reflections)}
                            </p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}

function getMoodInsight(reflections: Reflection[]): string {
    const recentMoods = reflections.slice(0, 7);
    const greatCount = recentMoods.filter(r => r.mood === 'great').length;
    const badCount = recentMoods.filter(r => r.mood === 'bad').length;

    if (greatCount > badCount * 2) {
        return "You're on a roll! Most of your recent days have been great. Keep up the discipline!";
    } else if (badCount > greatCount) {
        return "Noticed some tough days recently. Consider adjusting your routine to be more achievable.";
    } else {
        return "Your mood has been balanced. Small improvements to your routine could tip the scales toward more great days.";
    }
}
