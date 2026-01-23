'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    withAnimation?: boolean;
}

export default function Logo({ size = 'md', withAnimation = true }: LogoProps) {
    const sizeClasses = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-3xl',
    };

    const LogoContent = () => (
        <span className={`font-black tracking-tight ${sizeClasses[size]}`}>
            <span className="text-emerald-500">DAY</span>
            <span className="text-amber-400">PLANNER</span>
        </span>
    );

    if (withAnimation) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
            >
                <LogoContent />
            </motion.div>
        );
    }

    return <LogoContent />;
}

export function LogoLink({ user }: { user?: { email: string } | null }) {
    return (
        <Link href={user ? '/dashboard' : '/'} className="flex items-center">
            <Logo />
        </Link>
    );
}
