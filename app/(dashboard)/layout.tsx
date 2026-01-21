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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            <Navbar user={user} />
            <Sidebar />
            <main className="lg:pl-64 pt-4 pb-16 flex-grow">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>

            {/* Dashboard Footer */}
            <footer className="lg:pl-64 py-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-slate-400 dark:text-slate-500">
                        Made with ❤️ by{' '}
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
            </footer>
        </div>
    );
}
