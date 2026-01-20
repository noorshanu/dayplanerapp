'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export interface TimeBlock {
    id: string;
    startTime: string;
    endTime: string;
    activity: string;
    topic: string;
}

interface TimeBlockBuilderProps {
    blocks: TimeBlock[];
    onChange: (blocks: TimeBlock[]) => void;
}

export default function TimeBlockBuilder({ blocks, onChange }: TimeBlockBuilderProps) {
    const [newBlock, setNewBlock] = useState<Omit<TimeBlock, 'id'>>({
        startTime: '',
        endTime: '',
        activity: '',
        topic: '',
    });

    const generateId = () => Math.random().toString(36).substring(2, 11);

    const addBlock = () => {
        if (!newBlock.startTime || !newBlock.endTime || !newBlock.activity) {
            return;
        }

        const block: TimeBlock = {
            id: generateId(),
            ...newBlock,
        };

        // Sort blocks by start time
        const updatedBlocks = [...blocks, block].sort((a, b) => {
            return a.startTime.localeCompare(b.startTime);
        });

        onChange(updatedBlocks);
        setNewBlock({ startTime: '', endTime: '', activity: '', topic: '' });
    };

    const removeBlock = (id: string) => {
        onChange(blocks.filter((block) => block.id !== id));
    };

    const updateBlock = (id: string, field: keyof TimeBlock, value: string) => {
        const updatedBlocks = blocks.map((block) =>
            block.id === id ? { ...block, [field]: value } : block
        );
        onChange(updatedBlocks);
    };

    const formatTimeDisplay = (time: string): string => {
        if (!time) return '';
        const [hours, minutes] = time.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    return (
        <div className="space-y-6">
            {/* Add New Block Form */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">➕</span> Add Time Block
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Input
                        type="time"
                        label="Start Time"
                        value={newBlock.startTime}
                        onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
                    />
                    <Input
                        type="time"
                        label="End Time"
                        value={newBlock.endTime}
                        onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
                    />
                    <Input
                        label="Activity"
                        placeholder="e.g., Deep Work"
                        value={newBlock.activity}
                        onChange={(e) => setNewBlock({ ...newBlock, activity: e.target.value })}
                    />
                    <Input
                        label="Topic (optional)"
                        placeholder="e.g., Project X"
                        value={newBlock.topic}
                        onChange={(e) => setNewBlock({ ...newBlock, topic: e.target.value })}
                    />
                </div>
                <div className="mt-4">
                    <Button
                        onClick={addBlock}
                        disabled={!newBlock.startTime || !newBlock.endTime || !newBlock.activity}
                    >
                        Add Block
                    </Button>
                </div>
            </div>

            {/* Block List */}
            {blocks.length > 0 ? (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="text-2xl">📋</span> Schedule ({blocks.length} blocks)
                    </h3>
                    {blocks.map((block, index) => (
                        <div
                            key={block.id}
                            className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium">
                                            🕐 {formatTimeDisplay(block.startTime)} - {formatTimeDisplay(block.endTime)}
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        value={block.activity}
                                        onChange={(e) => updateBlock(block.id, 'activity', e.target.value)}
                                        className="w-full text-lg font-semibold text-slate-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                                        placeholder="Activity name"
                                    />
                                    {block.topic && (
                                        <input
                                            type="text"
                                            value={block.topic}
                                            onChange={(e) => updateBlock(block.id, 'topic', e.target.value)}
                                            className="w-full text-sm text-slate-500 dark:text-slate-400 bg-transparent border-none focus:outline-none focus:ring-0 p-0 mt-1"
                                            placeholder="Topic (optional)"
                                        />
                                    )}
                                </div>
                                <button
                                    onClick={() => removeBlock(block.id)}
                                    className="flex-shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    aria-label="Remove block"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <span className="text-4xl mb-3 block">📅</span>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        No time blocks yet
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                        Add your first time block to start building your routine
                    </p>
                </div>
            )}
        </div>
    );
}
