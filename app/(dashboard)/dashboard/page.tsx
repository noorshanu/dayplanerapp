'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PlanCard from '@/components/PlanCard';
import ScheduleView from '@/components/ScheduleView';

interface Plan {
    _id: string;
    title: string;
    active: boolean;
    blockCount: number;
}

interface Block {
    _id: string;
    startTime: string;
    endTime: string;
    activity: string;
    topic?: string | null;
}

export default function DashboardPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [activePlanBlocks, setActivePlanBlocks] = useState<Block[]>([]);
    const [currentTime, setCurrentTime] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPlans();
        updateCurrentTime();
        const interval = setInterval(updateCurrentTime, 60000);
        return () => clearInterval(interval);
    }, []);

    const updateCurrentTime = () => {
        const now = new Date();
        const time = now.toTimeString().slice(0, 5);
        setCurrentTime(time);
    };

    const fetchPlans = async () => {
        try {
            const response = await fetch('/api/plans');
            const data = await response.json();

            if (response.ok) {
                setPlans(data.plans);

                // Fetch active plan blocks
                const activePlan = data.plans.find((p: Plan) => p.active);
                if (activePlan) {
                    const blocksResponse = await fetch(`/api/plans/${activePlan._id}/blocks`);
                    const blocksData = await blocksResponse.json();
                    if (blocksResponse.ok) {
                        setActivePlanBlocks(blocksData.blocks);
                    }
                }
            } else {
                setError(data.error || 'Failed to load plans');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (id: string, active: boolean) => {
        try {
            await fetch(`/api/plans/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active }),
            });
            fetchPlans();
        } catch {
            console.error('Failed to toggle plan');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;

        try {
            await fetch(`/api/plans/${id}`, { method: 'DELETE' });
            fetchPlans();
        } catch {
            console.error('Failed to delete plan');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Loading your plans...</p>
                </div>
            </div>
        );
    }

    const activePlan = plans.find((p) => p.active);

    return (
        <div className="space-y-8 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Welcome back! Here&apos;s your daily routine.
                    </p>
                </div>
                <Link href="/plan/create">
                    <Button>
                        <span className="mr-2">+</span> Create Plan
                    </Button>
                </Link>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Today's Schedule */}
            {activePlan && (
                <Card>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Today&apos;s Schedule
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                From: {activePlan.title}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Current Time</p>
                            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                {currentTime}
                            </p>
                        </div>
                    </div>

                    <ScheduleView blocks={activePlanBlocks} currentTime={currentTime} />
                </Card>
            )}

            {!activePlan && plans.length > 0 && (
                <Card className="text-center py-12">
                    <span className="text-4xl mb-4 block">📋</span>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        No active plan
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Set one of your plans as active to see today&apos;s schedule
                    </p>
                </Card>
            )}

            {/* Plans List */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    Your Plans ({plans.length})
                </h2>

                {plans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plans.map((plan) => (
                            <PlanCard
                                key={plan._id}
                                id={plan._id}
                                title={plan.title}
                                active={plan.active}
                                blockCount={plan.blockCount}
                                onToggleActive={handleToggleActive}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-12">
                        <span className="text-4xl mb-4 block">📅</span>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            No plans yet
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Create your first daily routine to get started
                        </p>
                        <Link href="/plan/create">
                            <Button>Create Your First Plan</Button>
                        </Link>
                    </Card>
                )}
            </div>
        </div>
    );
}
