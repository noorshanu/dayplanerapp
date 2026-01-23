'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    HiOutlineViewGrid,
    HiOutlinePlus,
    HiOutlineCog,
    HiOutlineLogout
} from 'react-icons/hi';
import { LogoLink } from './Logo';

interface NavbarProps {
    user?: {
        email: string;
    } | null;
}

export default function Navbar({ user }: NavbarProps) {
    const pathname = usePathname();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <LogoLink user={user} />

                    {/* Navigation */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <div className="hidden sm:flex items-center gap-1">
                                    <NavLink href="/dashboard" active={pathname === '/dashboard'}>
                                        <HiOutlineViewGrid className="w-4 h-4 mr-1.5" />
                                        Dashboard
                                    </NavLink>
                                    <NavLink href="/plan/create" active={pathname === '/plan/create'}>
                                        <HiOutlinePlus className="w-4 h-4 mr-1.5" />
                                        Create Plan
                                    </NavLink>
                                    <NavLink href="/settings" active={pathname === '/settings'}>
                                        <HiOutlineCog className="w-4 h-4 mr-1.5" />
                                        Settings
                                    </NavLink>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="hidden sm:block text-sm text-slate-500 dark:text-slate-400">
                                        {user.email}
                                    </span>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleLogout}
                                        className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                    >
                                        <HiOutlineLogout className="w-4 h-4 mr-1.5" />
                                        Logout
                                    </motion.button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                                >
                                    Login
                                </Link>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Link
                                        href="/signup"
                                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                                    >
                                        Get Started
                                    </Link>
                                </motion.div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}

interface NavLinkProps {
    href: string;
    active: boolean;
    children: React.ReactNode;
}

function NavLink({ href, active, children }: NavLinkProps) {
    return (
        <Link
            href={href}
            className={`
        flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200
        ${active
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }
      `}
        >
            {children}
        </Link>
    );
}
