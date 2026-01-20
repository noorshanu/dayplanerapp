import React from 'react';

const features = [
    {
        icon: '📅',
        title: 'Create Once, Use Forever',
        description:
            'Design your perfect daily routine once without recreating every day. Simple time-block scheduling.',
    },
    {
        icon: '⏰',
        title: 'Smart Reminders',
        description:
            'Get notified at the exact right time via email. Never miss an important task or activity.',
    },
    {
        icon: '🤖',
        title: 'Telegram Integration',
        description:
            'Connect your Telegram account for instant mobile reminders. Stay on track wherever you are.',
    },
    {
        icon: '🌍',
        title: 'Timezone Aware',
        description:
            'Set your timezone and get reminders that respect your local time. Perfect for travelers.',
    },
    {
        icon: '🔒',
        title: 'Secure & Private',
        description:
            'Your data is encrypted and secure. No tracking, no ads, just a tool to help you succeed.',
    },
    {
        icon: '✨',
        title: 'Clean & Simple',
        description:
            'No bloat, no complexity. A beautifully designed interface that gets out of your way.',
    },
];

export default function FeaturesSection() {
    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Everything you need to{' '}
                        <span className="gradient-text">own your day</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
                        Simple yet powerful features designed to help you build and maintain productive habits.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
