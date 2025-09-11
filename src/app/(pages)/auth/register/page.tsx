"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import 'devextreme/dist/css/dx.light.css';
import { Button } from 'devextreme-react/button';
import { useToast } from '@/components/toast/ToastContext';
import { TextBox } from 'devextreme-react/text-box';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', userId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Basic client validation for userId
      const numericUserId = Number(form.userId);
      if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
        setError('Unique integer Id must be a positive integer');
        push({ type: 'error', title: 'Invalid Unique Id', description: 'Provide a positive integer for Unique Id.' });
        setLoading(false);
        return;
      }
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, userId: numericUserId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || 'Registration failed1';
        setError(msg);
        push({ type: 'error', title: 'Registration Failed2', description: msg });
        return;
      }
      push({ type: 'success', title: 'Account Created', description: 'You can now sign in.' });
      router.push('/auth/login');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed3';
      setError(msg);
      push({ type: 'error', title: 'Registration Failed4', description: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white via-sky-50 to-sky-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-800 dark:text-slate-100">
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/worldmap.png')] bg-cover bg-center opacity-10 dark:opacity-20" />
        <div className="m-auto max-w-md text-center space-y-6 p-10">
          <h1 className="text-4xl font-bold text-sky-600 dark:text-sky-400">Create Account</h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Start leveraging unified logistics analytics, invoice tracking and shipment visibility today.
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-sky-600 dark:text-sky-300">Register</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Fill your details to get started</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide">Username</label>
              <TextBox value={form.username} onValueChanged={(e) => update('username', e.value)} placeholder="johndoe" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide">Unique integer Id</label>
              <TextBox value={form.userId} onValueChanged={(e) => update('userId', e.value)} placeholder="e.g. 12345" />
              {form.userId && (!Number.isInteger(Number(form.userId)) || Number(form.userId) <= 0) && (
                <div className="mt-1 text-[11px] text-red-600 dark:text-red-400">Must be a positive integer.</div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide">Email</label>
              <TextBox value={form.email} onValueChanged={(e) => update('email', e.value)} placeholder="name@company.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide">Password</label>
              <TextBox mode="password" value={form.password} onValueChanged={(e) => update('password', e.value)} placeholder="At least 6 characters" />
              {form.password.length > 0 && form.password.length < 6 && (
                <div className="mt-1 text-[11px] text-red-600 dark:text-red-400">Minimum 6 characters.</div>
              )}
            </div>
          </div>
          {error && <div className="sr-only" role="alert">{error}</div>}
          <Button
            type="button"
            text={loading ? 'Creating...' : 'Create Account'}
            stylingMode="contained"
            disabled={loading}
            // DevExtreme ClickEvent => call handler without needing event typing
            onClick={() => { void handleSubmit({ preventDefault: () => {} } as React.FormEvent); }}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white"
          />
          <p className="text-xs text-center text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-sky-600 dark:text-sky-400 font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}