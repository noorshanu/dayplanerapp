import React from 'react';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret');

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return { email: payload.email as string };
    } catch {
        return null;
    }
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getUser();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Navbar user={user} />
            <Sidebar />
            <main className="lg:pl-64 pt-4 pb-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
