'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Please enter your email');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Something went wrong');
                return;
            }

            setSubmitted(true);
            // Redirect to reset password page with email
            setTimeout(() => {
                router.push(`/reset-password?email=${encodeURIComponent(email)}`);
            }, 2000);
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <Card className="w-full">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                        ✅
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Check your email
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        If an account exists with this email, we&apos;ve sent a password reset code.
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Redirecting to reset page...
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                    🔑
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Forgot password?
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    No worries, we&apos;ll send you reset instructions.
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                />

                <Button type="submit" className="w-full" loading={loading}>
                    Send Reset Code
                </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                <Link
                    href="/login"
                    className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center justify-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to login
                </Link>
            </div>
        </Card>
    );
}
