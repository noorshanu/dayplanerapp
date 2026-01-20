import React from 'react';
import Link from 'next/link';

export default function FooterSection() {
    return (
        <footer className="py-12 border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">📅</span>
                        <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Day Planner
                        </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                        <Link href="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                            Login
                        </Link>
                        <Link href="/signup" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                            Sign Up
                        </Link>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        © {new Date().getFullYear()} Day Planner. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
