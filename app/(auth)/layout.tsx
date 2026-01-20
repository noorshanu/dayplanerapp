import React from 'react';
import Link from 'next/link';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between p-4 sm:p-6">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl">📅</span>
                    <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Day Planner
                    </span>
                </Link>
            </header>

            {/* Main content */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </main>

            {/* Background decorations */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
            </div>
        </div>
    );
}
