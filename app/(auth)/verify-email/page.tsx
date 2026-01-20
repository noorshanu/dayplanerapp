'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import OTPInput from '@/components/ui/OTPInput';
import Button from '@/components/ui/Button';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleVerify = async () => {
        if (otp.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Verification failed');
                return;
            }

            setSuccess('Email verified successfully! Redirecting...');
            setTimeout(() => {
                router.push('/dashboard');
                router.refresh();
            }, 1500);
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');

        try {
            const response = await fetch('/api/auth/resend-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, purpose: 'email_verify' }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to resend code');
                return;
            }

            setSuccess('New verification code sent!');
            setCountdown(60);
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setResending(false);
        }
    };

    useEffect(() => {
        if (otp.length === 6) {
            handleVerify();
        }
    }, [otp]);

    return (
        <Card className="w-full">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                    ✉️
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Check your email
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    We sent a verification code to
                    <br />
                    <span className="font-medium text-slate-900 dark:text-white">{email}</span>
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm text-center">
                    {success}
                </div>
            )}

            <div className="space-y-6">
                <OTPInput
                    value={otp}
                    onChange={setOtp}
                    disabled={loading}
                />

                <Button
                    onClick={handleVerify}
                    className="w-full"
                    loading={loading}
                    disabled={otp.length !== 6}
                >
                    Verify Email
                </Button>

                <div className="text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Didn&apos;t receive the code?
                    </p>
                    <button
                        onClick={handleResend}
                        disabled={resending || countdown > 0}
                        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {countdown > 0 ? `Resend in ${countdown}s` : resending ? 'Sending...' : 'Resend code'}
                    </button>
                </div>
            </div>
        </Card>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<Card className="w-full"><div className="text-center p-8">Loading...</div></Card>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
