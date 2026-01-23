'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';


export default function FooterSection() {
    return (
        <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="py-12 border-t border-slate-200 dark:border-slate-800"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                        <Link href="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                            Login
                        </Link>
                        <Link href="/signup" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                            Sign Up
                        </Link>
                    </div>

                    <div className="text-center md:text-right">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            © {new Date().getFullYear()} DAYPLANNER. All rights reserved.
                        </p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 flex items-center justify-center md:justify-end gap-1">
                            Made with <FaHeart className="text-red-500 w-3 h-3" /> by{' '}
                            <a
                                href="https://www.nooralam.pro"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-500 hover:text-indigo-600 transition-colors font-medium"
                            >
                                Noor Alam
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </motion.footer>
    );
}
