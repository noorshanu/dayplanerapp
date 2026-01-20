'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/dashboard';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError('');

        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.needsVerification) {
                    router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
                    return;
                }
                setServerError(data.error || 'Something went wrong');
                return;
            }

            // Redirect to dashboard or original destination
            router.push(redirectTo);
            router.refresh();
        } catch {
            setServerError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Welcome back
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Sign in to continue to your dashboard
                </p>
            </div>

            {serverError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                    autoComplete="email"
                />

                <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={errors.password}
                    autoComplete="current-password"
                />

                <div className="flex items-center justify-end">
                    <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                    >
                        Forgot password?
                    </Link>
                </div>

                <Button type="submit" className="w-full" loading={loading}>
                    Sign In
                </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                Don&apos;t have an account?{' '}
                <Link
                    href="/signup"
                    className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                >
                    Create one
                </Link>
            </div>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<Card className="w-full"><div className="text-center p-8">Loading...</div></Card>}>
            <LoginForm />
        </Suspense>
    );
}
