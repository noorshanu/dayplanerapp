'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import TimeBlockBuilder, { TimeBlock } from '@/components/TimeBlockBuilder';

export default function CreatePlanPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [blocks, setBlocks] = useState<TimeBlock[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Please enter a plan title');
            return;
        }

        if (blocks.length === 0) {
            setError('Please add at least one time block');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/plans', {
                method: 'POST',
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

    return (
        <div className="space-y-8 py-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Create New Plan
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Build your daily routine by adding time blocks
                </p>
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
                    <Button type="submit" loading={loading}>
                        Create Plan ({blocks.length} blocks)
                    </Button>
                </div>
            </form>
        </div>
    );
}
