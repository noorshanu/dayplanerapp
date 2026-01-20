'use client';

import React from 'react';
import LiveNowMode from '@/components/LiveNowMode';
import DisciplineScore from '@/components/DisciplineScore';

interface RealityModeProps {
    enabled: boolean;
}

export default function RealityMode({ enabled }: RealityModeProps) {
    if (!enabled) {
        return null;
    }

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
            {/* Minimal header */}
            <div className="w-full max-w-md space-y-6">
                {/* Discipline Score - Compact */}
                <DisciplineScore compact />

                {/* Live Now Mode */}
                <LiveNowMode realityMode />

                {/* Reality Mode indicator */}
                <div className="text-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs text-slate-500 dark:text-slate-400">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                        Reality Mode Active
                    </span>
                </div>
            </div>
        </div>
    );
}
