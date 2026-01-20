'use client';

import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import Select from '@/components/ui/Select';
import { TIMEZONES } from '@/lib/timezone';

interface Settings {
    email: string;
    timezone: string;
    reminderPrefs: {
        email: boolean;
        telegram: boolean;
    };
    telegramConnected: boolean;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [telegramLinkData, setTelegramLinkData] = useState<{
        deepLink: string;
        expiresIn: number;
    } | null>(null);
    const [linkingTelegram, setLinkingTelegram] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings');
            const data = await response.json();

            if (response.ok) {
                setSettings(data.settings);
            } else {
                setError(data.error || 'Failed to load settings');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (updates: Partial<Settings>) => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            const data = await response.json();

            if (response.ok) {
                setSettings((prev) => (prev ? { ...prev, ...data.settings } : null));
                setSuccess('Settings updated successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.error || 'Failed to update settings');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleTimezoneChange = (timezone: string) => {
        updateSettings({ timezone });
    };

    const handleReminderToggle = (type: 'email' | 'telegram', enabled: boolean) => {
        if (!settings) return;
        updateSettings({
            reminderPrefs: {
                ...settings.reminderPrefs,
                [type]: enabled,
            },
        });
    };

    const handleConnectTelegram = async () => {
        setLinkingTelegram(true);
        setError('');

        try {
            const response = await fetch('/api/telegram/link', {
                method: 'POST',
            });

            const data = await response.json();

            if (response.ok) {
                setTelegramLinkData({
                    deepLink: data.deepLink,
                    expiresIn: data.expiresIn,
                });
            } else {
                setError(data.error || 'Failed to generate link');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLinkingTelegram(false);
        }
    };

    const handleDisconnectTelegram = async () => {
        if (!confirm('Are you sure you want to disconnect Telegram?')) return;

        try {
            const response = await fetch('/api/telegram/link', {
                method: 'DELETE',
            });

            if (response.ok) {
                setSettings((prev) =>
                    prev
                        ? {
                            ...prev,
                            telegramConnected: false,
                            reminderPrefs: { ...prev.reminderPrefs, telegram: false },
                        }
                        : null
                );
                setSuccess('Telegram disconnected successfully!');
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch {
            setError('Network error. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Loading settings...</p>
                </div>
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
                Failed to load settings. Please refresh the page.
            </div>
        );
    }

    const timezoneOptions = TIMEZONES.map((tz) => ({
        value: tz.value,
        label: tz.label,
    }));

    return (
        <div className="space-y-8 py-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Settings
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Manage your account and notification preferences
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400">
                    {success}
                </div>
            )}

            {/* Account */}
            <Card>
                <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>Your account information</CardDescription>
                </CardHeader>
                <div className="mt-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Email</p>
                    <p className="text-lg font-medium text-slate-900 dark:text-white">
                        {settings.email}
                    </p>
                </div>
            </Card>

            {/* Timezone */}
            <Card>
                <CardHeader>
                    <CardTitle>Timezone</CardTitle>
                    <CardDescription>
                        Set your timezone for accurate reminder scheduling
                    </CardDescription>
                </CardHeader>
                <div className="mt-4">
                    <Select
                        options={timezoneOptions}
                        value={settings.timezone}
                        onChange={handleTimezoneChange}
                        placeholder="Select your timezone"
                    />
                </div>
            </Card>

            {/* Reminder Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle>Reminder Preferences</CardTitle>
                    <CardDescription>
                        Choose how you want to receive routine reminders
                    </CardDescription>
                </CardHeader>
                <div className="mt-6 space-y-6">
                    <Toggle
                        checked={settings.reminderPrefs.email}
                        onChange={(checked) => handleReminderToggle('email', checked)}
                        label="Email Reminders"
                        description="Receive reminders via email when your scheduled activities start"
                    />
                    <Toggle
                        checked={settings.reminderPrefs.telegram}
                        onChange={(checked) => handleReminderToggle('telegram', checked)}
                        label="Telegram Reminders"
                        description="Get instant notifications on Telegram (requires connection)"
                        disabled={!settings.telegramConnected}
                    />
                </div>
            </Card>

            {/* Telegram Integration */}
            <Card>
                <CardHeader>
                    <CardTitle>Telegram Integration</CardTitle>
                    <CardDescription>
                        Connect your Telegram account for mobile reminders
                    </CardDescription>
                </CardHeader>
                <div className="mt-6">
                    {settings.telegramConnected ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-xl">
                                    📱
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        Telegram Connected
                                    </p>
                                    <p className="text-sm text-green-600 dark:text-green-400">
                                        You&apos;ll receive reminders on Telegram
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" onClick={handleDisconnectTelegram}>
                                Disconnect
                            </Button>
                        </div>
                    ) : telegramLinkData ? (
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                                Connect via Telegram
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                Click the button below to open Telegram and complete the connection:
                            </p>
                            <a
                                href={telegramLinkData.deepLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl hover:shadow-lg transition-all"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                                </svg>
                                Open in Telegram
                            </a>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                                Link expires in {Math.floor(telegramLinkData.expiresIn / 60)} minutes
                            </p>
                            <button
                                onClick={fetchSettings}
                                className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                I&apos;ve connected, refresh status →
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-xl">
                                    📱
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        Telegram Not Connected
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Connect to receive reminders on your phone
                                    </p>
                                </div>
                            </div>
                            <Button onClick={handleConnectTelegram} loading={linkingTelegram}>
                                Connect Telegram
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            {saving && (
                <div className="fixed bottom-4 right-4 px-4 py-2 bg-slate-900 text-white rounded-lg shadow-lg">
                    Saving...
                </div>
            )}
        </div>
    );
}
