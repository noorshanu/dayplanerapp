'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    HiOutlineViewGrid,
    HiOutlinePlus,
    HiOutlineMoon,
    HiOutlineCog,
    HiOutlineLightBulb
} from 'react-icons/hi';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HiOutlineViewGrid },
    { name: 'Create Plan', href: '/plan/create', icon: HiOutlinePlus },
    { name: 'Reflection', href: '/reflection', icon: HiOutlineMoon },
    { name: 'Settings', href: '/settings', icon: HiOutlineCog },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16">
            <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
                <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                    <nav className="flex-1 px-4 space-y-1">
                        {navigation.map((item, index) => {
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            const Icon = item.icon;

                            return (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.3 }}
                                >
                                    <Link
                                        href={item.href}
                                        className={`
                      group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                      ${isActive
                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }
                    `}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.name}
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </nav>
                </div>

                {/* Quick Tips */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className="flex-shrink-0 p-4"
                >
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-800">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                            <HiOutlineLightBulb className="w-4 h-4 text-amber-500" />
                            Pro Tip
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            Connect your Telegram account to receive reminders on the go!
                        </p>
                    </div>
                </motion.div>
            </div>
        </aside>
    );
}
