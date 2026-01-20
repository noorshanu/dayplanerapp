import React from 'react';

interface Block {
    _id: string;
    startTime: string;
    endTime: string;
    activity: string;
    topic?: string | null;
}

interface ScheduleViewProps {
    blocks: Block[];
    currentTime?: string; // HH:mm format
}

export default function ScheduleView({ blocks, currentTime }: ScheduleViewProps) {
    const formatTimeDisplay = (time: string): string => {
        const [hours, minutes] = time.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const isCurrentBlock = (startTime: string, endTime: string): boolean => {
        if (!currentTime) return false;
        return currentTime >= startTime && currentTime < endTime;
    };

    const isPastBlock = (endTime: string): boolean => {
        if (!currentTime) return false;
        return currentTime >= endTime;
    };

    const getBlockColors = (startTime: string, endTime: string) => {
        if (isCurrentBlock(startTime, endTime)) {
            return {
                bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
                text: 'text-white',
                border: 'border-green-500',
            };
        }
        if (isPastBlock(endTime)) {
            return {
                bg: 'bg-slate-100 dark:bg-slate-800',
                text: 'text-slate-400 dark:text-slate-500',
                border: 'border-slate-200 dark:border-slate-700',
            };
        }
        return {
            bg: 'bg-white dark:bg-slate-800',
            text: 'text-slate-900 dark:text-white',
            border: 'border-indigo-200 dark:border-indigo-800',
        };
    };

    if (blocks.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <span className="text-4xl mb-3 block">📭</span>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    No schedule found
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                    Create a plan and add time blocks to see your schedule
                </p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full" />

            <div className="space-y-4">
                {blocks.map((block, index) => {
                    const colors = getBlockColors(block.startTime, block.endTime);
                    const isCurrent = isCurrentBlock(block.startTime, block.endTime);

                    return (
                        <div key={block._id} className="relative flex gap-4 pl-12">
                            {/* Timeline dot */}
                            <div
                                className={`
                  absolute left-4 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900
                  ${isCurrent ? 'bg-green-500 ring-4 ring-green-500/30 animate-pulse' : colors.bg}
                  ${!isCurrent && !isPastBlock(block.endTime) ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : ''}
                  ${isPastBlock(block.endTime) ? 'bg-slate-300 dark:bg-slate-600' : ''}
                `}
                                style={{ top: '1.25rem' }}
                            />

                            {/* Block card */}
                            <div
                                className={`
                  flex-1 rounded-2xl border-2 p-4 transition-all duration-200
                  ${colors.border}
                  ${isCurrent ? colors.bg : 'bg-white dark:bg-slate-800'}
                  ${isCurrent ? 'shadow-lg shadow-green-500/20' : 'hover:shadow-md'}
                `}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span
                                                className={`
                          inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium
                          ${isCurrent
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                                    }
                        `}
                                            >
                                                🕐 {formatTimeDisplay(block.startTime)} - {formatTimeDisplay(block.endTime)}
                                            </span>
                                            {isCurrent && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 text-white text-xs font-medium rounded-lg">
                                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                                    Now
                                                </span>
                                            )}
                                        </div>
                                        <h4
                                            className={`text-lg font-semibold ${isCurrent ? 'text-white' : colors.text}`}
                                        >
                                            {block.activity}
                                        </h4>
                                        {block.topic && (
                                            <p
                                                className={`text-sm mt-1 ${isCurrent ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                                                    }`}
                                            >
                                                📚 {block.topic}
                                            </p>
                                        )}
                                    </div>
                                    <div
                                        className={`
                      flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold
                      ${isCurrent
                                                ? 'bg-white/20 text-white'
                                                : isPastBlock(block.endTime)
                                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                                                    : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                                            }
                    `}
                                    >
                                        {index + 1}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
