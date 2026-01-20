import React from 'react';
import Link from 'next/link';

export default function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/30 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="mb-6">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Now with Telegram reminders
                    </span>
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
                    <span className="block text-slate-900 dark:text-white">Master Your</span>
                    <span className="gradient-text">Daily Routine</span>
                </h1>

                <p className="max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-400 mb-10">
                    Plan your perfect day once, reuse it forever. Get timely reminders via email and Telegram
                    to stay on track and achieve your goals.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/signup"
                        className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-1"
                    >
                        Start Planning Free →
                    </Link>
                    <Link
                        href="/login"
                        className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300"
                    >
                        Sign In
                    </Link>
                </div>

                {/* Stats */}
                <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">100%</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Free to use</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">24/7</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Reminders</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">∞</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Plans</div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </section>
    );
}
