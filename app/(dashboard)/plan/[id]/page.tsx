'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import TimeBlockBuilder, { TimeBlock } from '@/components/TimeBlockBuilder';

interface PlanData {
    _id: string;
    title: string;
    active: boolean;
    blocks: Array<{
        _id: string;
        startTime: string;
        endTime: string;
        activity: string;
        topic?: string | null;
    }>;
}

export default function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [plan, setPlan] = useState<PlanData | null>(null);
    const [title, setTitle] = useState('');
    const [blocks, setBlocks] = useState<TimeBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPlan();
    }, [resolvedParams.id]);

    const fetchPlan = async () => {
        try {
            const response = await fetch(`/api/plans/${resolvedParams.id}`);
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to load plan');
                return;
            }

            setPlan(data.plan);
            setTitle(data.plan.title);
            setBlocks(
                data.plan.blocks.map((b: PlanData['blocks'][0]) => ({
                    id: b._id,
                    startTime: b.startTime,
                    endTime: b.endTime,
                    activity: b.activity,
                    topic: b.topic || '',
                }))
            );
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Please enter a plan title');
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(`/api/plans/${resolvedParams.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
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
                setError(data.error || 'Failed to update plan');
                return;
            }

            router.push('/dashboard');
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Loading plan...</p>
                </div>
            </div>
        );
    }

    if (!plan) {
        return (
            <Card className="text-center py-12">
                <span className="text-4xl mb-4 block">❌</span>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Plan not found
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                    This plan doesn&apos;t exist or you don&apos;t have access to it.
                </p>
                <Button onClick={() => router.push('/dashboard')}>
                    Back to Dashboard
                </Button>
            </Card>
        );
    }

    return (
        <div className="space-y-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Edit Plan
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Update your daily routine
                    </p>
                </div>
                {plan.active && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-full">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        Active Plan
                    </span>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Plan Title */}
                <Card className="mb-6">
                    <Input
                        label="Plan Title"
                        placeholder="e.g., Weekday Routine, Weekend Plan"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
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
                    <Button type="submit" loading={saving}>
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
