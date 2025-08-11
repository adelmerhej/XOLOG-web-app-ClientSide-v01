"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import 'devextreme/dist/css/dx.light.css';
import { Button } from 'devextreme-react/button';
import { TextBox } from 'devextreme-react/text-box';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
  router.push('/auth/login');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message); else setError('Registration failed');
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
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide">Email</label>
              <TextBox value={form.email} onValueChanged={(e) => update('email', e.value)} placeholder="name@company.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide">Password</label>
              <TextBox mode="password" value={form.password} onValueChanged={(e) => update('password', e.value)} placeholder="Strong password" />
            </div>
          </div>
          {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
          <Button
            type="submit"
            text={loading ? 'Creating...' : 'Create Account'}
            stylingMode="contained"
            disabled={loading}
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