import React from 'react';
import Link from 'next/link';

interface PlanCardProps {
    id: string;
    title: string;
    active: boolean;
    blockCount: number;
    onToggleActive?: (id: string, active: boolean) => void;
    onDelete?: (id: string) => void;
}

export default function PlanCard({
    id,
    title,
    active,
    blockCount,
    onToggleActive,
    onDelete,
}: PlanCardProps) {
    return (
        <div
            className={`
        relative bg-white dark:bg-slate-800 rounded-2xl border-2 p-6
        transition-all duration-200 hover:shadow-lg
        ${active
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }
      `}
        >
            {active && (
                <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium rounded-full">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    Active
                </div>
            )}

            <Link href={`/plan/${id}`} className="block">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 pr-20">
                    {title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {blockCount} time block{blockCount !== 1 ? 's' : ''}
                </p>
            </Link>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3">
                <button
                    onClick={() => onToggleActive?.(id, !active)}
                    className={`
            flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
            ${active
                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:shadow-indigo-500/25'
                        }
          `}
                >
                    {active ? 'Deactivate' : 'Set Active'}
                </button>
                <button
                    onClick={() => onDelete?.(id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    aria-label="Delete plan"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
