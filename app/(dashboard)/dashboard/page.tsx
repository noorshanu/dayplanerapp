'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import PlanCard from '@/components/PlanCard';
import ScheduleView from '@/components/ScheduleView';
import LiveNowMode from '@/components/LiveNowMode';
import DisciplineScore from '@/components/DisciplineScore';
import RealityMode from '@/components/RealityMode';

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

interface Settings {
    realityModeEnabled: boolean;
}

type ViewMode = 'live' | 'schedule';

export default function DashboardPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [activePlanBlocks, setActivePlanBlocks] = useState<Block[]>([]);
    const [currentTime, setCurrentTime] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('live');
    const [realityMode, setRealityMode] = useState(false);

    useEffect(() => {
        fetchPlans();
        fetchSettings();
        updateCurrentTime();
        const interval = setInterval(updateCurrentTime, 60000);
        return () => clearInterval(interval);
    }, []);

    const updateCurrentTime = () => {
        const now = new Date();
        const time = now.toTimeString().slice(0, 5);
        setCurrentTime(time);
    };

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings');
            const data = await response.json();
            if (response.ok && data.settings) {
                setRealityMode(data.settings.realityModeEnabled || false);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
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

    const toggleRealityMode = async () => {
        const newValue = !realityMode;
        setRealityMode(newValue);
        try {
            await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ realityModeEnabled: newValue }),
            });
        } catch (error) {
            console.error('Failed to update reality mode:', error);
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

    // Reality Mode - Ultra minimal view
    if (realityMode) {
        return (
            <div className="py-8">
                <div className="flex justify-end mb-4">
                    <Toggle
                        checked={realityMode}
                        onChange={toggleRealityMode}
                        label=""
                        description=""
                    />
                </div>
                <RealityMode enabled={realityMode} />
            </div>
        );
    }

    return (
        <div className="space-y-8 py-8">
            {/* Header with Reality Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Welcome back! Here&apos;s your daily routine.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Toggle
                        checked={realityMode}
                        onChange={toggleRealityMode}
                        label="Reality Mode"
                    />
                    <Link href="/plan/create">
                        <Button>
                            <span className="mr-2">+</span> Create Plan
                        </Button>
                    </Link>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Discipline Score + Live Now Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Discipline Score */}
                <div className="lg:col-span-1">
                    <DisciplineScore />
                </div>

                {/* Live Now / Schedule View */}
                <div className="lg:col-span-2">
                    <Card>
                        {/* View Toggle */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewMode('live')}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${viewMode === 'live'
                                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    🔴 Live Now
                                </button>
                                <button
                                    onClick={() => setViewMode('schedule')}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${viewMode === 'schedule'
                                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    📋 Full Schedule
                                </button>
                            </div>
                            {activePlan && (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {activePlan.title}
                                </p>
                            )}
                        </div>

                        {/* Content */}
                        {activePlan ? (
                            viewMode === 'live' ? (
                                <LiveNowMode />
                            ) : (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                            Today&apos;s Schedule
                                        </h3>
                                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                            {currentTime}
                                        </p>
                                    </div>
                                    <ScheduleView blocks={activePlanBlocks} currentTime={currentTime} />
                                </div>
                            )
                        ) : (
                            <div className="text-center py-12">
                                <span className="text-4xl mb-4 block">📋</span>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    No active plan
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-4">
                                    Set one of your plans as active to see today&apos;s schedule
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

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
