'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
                        <span className="text-2xl">📅</span>
                        <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Day Planner
                        </span>
                    </Link>

                    {/* Navigation */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <div className="hidden sm:flex items-center gap-1">
                                    <NavLink href="/dashboard" active={pathname === '/dashboard'}>
                                        Dashboard
                                    </NavLink>
                                    <NavLink href="/plan/create" active={pathname === '/plan/create'}>
                                        Create Plan
                                    </NavLink>
                                    <NavLink href="/settings" active={pathname === '/settings'}>
                                        Settings
                                    </NavLink>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="hidden sm:block text-sm text-slate-500 dark:text-slate-400">
                                        {user.email}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                    >
                                        Logout
                                    </button>
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
                                <Link
                                    href="/signup"
                                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
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
        px-4 py-2 text-sm font-medium rounded-xl transition-colors
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
