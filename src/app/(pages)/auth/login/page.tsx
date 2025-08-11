"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import 'devextreme/dist/css/dx.light.css';
import { Button } from 'devextreme-react/button';
import { TextBox } from 'devextreme-react/text-box';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError('Invalid credentials');
    } else {
  router.push('/dashboard');
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white via-sky-50 to-sky-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-800 dark:text-slate-100">
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/worldmap.png')] bg-cover bg-center opacity-10 dark:opacity-20" />
        <div className="m-auto max-w-md text-center space-y-6 p-10">
          <h1 className="text-4xl font-bold text-sky-600 dark:text-sky-400">Welcome Back</h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Access your logistics intelligence dashboard. Monitor shipments, invoices and analytics in real time.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-10 text-left text-xs">
            <div className="p-3 rounded-lg bg-white/70 dark:bg-slate-800/60 shadow border border-sky-100 dark:border-slate-700">
              <div className="font-semibold mb-1 text-sky-600 dark:text-sky-300">Visibility</div>
              Live voyage tracking.
            </div>
            <div className="p-3 rounded-lg bg-white/70 dark:bg-slate-800/60 shadow border border-sky-100 dark:border-slate-700">
              <div className="font-semibold mb-1 text-sky-600 dark:text-sky-300">Finance</div>
              Invoice status insights.
            </div>
            <div className="p-3 rounded-lg bg-white/70 dark:bg-slate-800/60 shadow border border-sky-100 dark:border-slate-700">
              <div className="font-semibold mb-1 text-sky-600 dark:text-sky-300">Analytics</div>
              KPI dashboards.
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-sky-600 dark:text-sky-300">Sign In</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Use your XOLOG account credentials</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide">Username</label>
              <TextBox value={username} onValueChanged={(e) => setUsername(e.value)} placeholder="Enter username" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide">Password</label>
              <TextBox mode="password" value={password} onValueChanged={(e) => setPassword(e.value)} placeholder="Enter password" />
            </div>
          </div>
          {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
          <Button
            type="submit"
            text={loading ? 'Signing in...' : 'Sign In'}
            stylingMode="contained"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white"
          />
          <p className="text-xs text-center text-slate-500 dark:text-slate-400">
            No account?{' '}
            <Link href="/auth/register" className="text-sky-600 dark:text-sky-400 font-medium hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}