import React from 'react';

const steps = [
    {
        number: '01',
        title: 'Create Your Account',
        description: 'Sign up with your email and verify it with a simple OTP code.',
        icon: '👤',
    },
    {
        number: '02',
        title: 'Build Your Routine',
        description: 'Add time blocks for your daily activities — work, exercise, breaks, and more.',
        icon: '📝',
    },
    {
        number: '03',
        title: 'Set Your Preferences',
        description: 'Choose your timezone and enable email or Telegram notifications.',
        icon: '⚙️',
    },
    {
        number: '04',
        title: 'Stay on Track',
        description: 'Receive timely reminders and follow your routine every single day.',
        icon: '🎯',
    },
];

export default function HowItWorksSection() {
    return (
        <section className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Get started in <span className="gradient-text">minutes</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
                        Four simple steps to transform your daily productivity.
                    </p>
                </div>

                <div className="relative">
                    {/* Connection line */}
                    <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 -translate-y-1/2" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="relative">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 relative z-10">
                                    {/* Step number badge */}
                                    <div className="absolute -top-4 left-8 w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {index + 1}
                                    </div>

                                    <div className="text-4xl mb-4">{step.icon}</div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
