'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import OTPInput from '@/components/ui/OTPInput';
import Button from '@/components/ui/Button';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const [step, setStep] = useState<'otp' | 'password'>('otp');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleVerifyOTP = () => {
        if (otp.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }
        setError('');
        setStep('password');
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    otp,
                    newPassword: password,
                    confirmPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Something went wrong');
                if (data.error?.includes('OTP')) {
                    setStep('otp');
                    setOtp('');
                }
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Card className="w-full">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                        ✅
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Password reset!
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Your password has been successfully reset.
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Redirecting to login...
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                    {step === 'otp' ? '🔐' : '🔒'}
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {step === 'otp' ? 'Enter verification code' : 'Set new password'}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    {step === 'otp'
                        ? `Enter the code we sent to ${email}`
                        : 'Choose a strong password for your account'}
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
                    {error}
                </div>
            )}

            {step === 'otp' ? (
                <div className="space-y-6">
                    <OTPInput value={otp} onChange={setOtp} />

                    <Button
                        onClick={handleVerifyOTP}
                        className="w-full"
                        disabled={otp.length !== 6}
                    >
                        Continue
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleResetPassword} className="space-y-5">
                    <Input
                        label="New Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        helperText="Must be at least 8 characters"
                        autoComplete="new-password"
                    />

                    <Input
                        label="Confirm Password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                    />

                    <Button type="submit" className="w-full" loading={loading}>
                        Reset Password
                    </Button>

                    <button
                        type="button"
                        onClick={() => setStep('otp')}
                        className="w-full text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                        ← Back to code entry
                    </button>
                </form>
            )}

            <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                <Link
                    href="/login"
                    className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                >
                    Back to login
                </Link>
            </div>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<Card className="w-full"><div className="text-center p-8">Loading...</div></Card>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
