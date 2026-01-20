import React from 'react';
import Link from 'next/link';

export default function CTASection() {
    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-12 relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />

                    <div className="relative z-10">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Ready to master your routine?
                        </h2>
                        <p className="text-lg text-indigo-100 mb-8 max-w-xl mx-auto">
                            Join thousands of productive people who use Day Planner to stay organized and achieve
                            their goals every single day.
                        </p>
                        <Link
                            href="/signup"
                            className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-indigo-600 bg-white rounded-2xl hover:bg-indigo-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >
                            Get Started Free
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
