"use client";

import React, { useState, useMemo, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import 'devextreme/dist/css/dx.light.css';
import { Button } from 'devextreme-react/button';
import { useToast } from '@/components/toast/ToastContext';
import { TextBox } from 'devextreme-react/text-box';

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [identifier, setIdentifier] = useState(''); // username or email
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  const identifierValid = useMemo(() => {
    const v = identifier.trim();
    if (v.includes('@')) {
      // basic email check
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }
    return v.length >= 3; // username rule
  }, [identifier]);
  const passwordValid = useMemo(() => password.length >= 6, [password]);
  const formValid = identifierValid && passwordValid;

  async function handleSubmit(e?: { preventDefault?: () => void }) {
    e?.preventDefault?.();
    if (!formValid) return;

    try {
      setLoading(true);
      setError(null);

      const res = await signIn('credentials', {
        identifier: identifier.trim(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (!res) {
        setError('Unexpected error: no response');
        push({ type: 'error', title: 'Login Failed', description: 'Unexpected: no response from server.' });
      } else if (res.error) {
        let msg = 'Invalid credentials';
        if (res.error.toLowerCase().includes('no user')) msg = 'User not found';
        else if (res.error.toLowerCase().includes('password')) msg = 'Incorrect password';
        setError(msg);
        push({ type: 'error', title: 'Login Failed', description: msg });
      } else {
        push({ type: 'success', title: 'Welcome', description: 'Login successful.' });
        // Avoid absolute redirects that could point to localhost by forcing same-origin path
        router.push(callbackUrl);
      }
      
  } catch {
      setError('Login failed');
      push({ type: 'error', title: 'Login Failed', description: 'Network or server issue.' });
    } finally {
      setLoading(false);
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
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide">Username or Email</label>
              <TextBox value={identifier} onValueChanged={(e) => setIdentifier(e.value)} placeholder="Enter username or email" />
              {!identifierValid && identifier.length > 0 && (
                <div className="mt-1 text-[11px] text-red-600 dark:text-red-400">Enter valid email or at least 3 character username.</div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide">Password</label>
              <div className="relative">
                <TextBox
                  mode={showPassword ? 'text' : 'password'}
                  value={password}
                  onValueChanged={(e) => setPassword(e.value)}
                  placeholder="Enter password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition"
                  tabIndex={0}
                >
                  {showPassword ? (
                    // Eye off icon (simple SVG)
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7-1-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 1 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12A3 3 0 0 1 9.88 9.88M3 3l18 18" />
                    </svg>
                  ) : (
                    // Eye icon
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {!passwordValid && password.length > 0 && (
                <div className="mt-1 text-[11px] text-red-600 dark:text-red-400">Minimum 6 characters.</div>
              )}
            </div>
          </div>
          {error && <div className="sr-only" role="alert">{error}</div>}
          <Button
            type="button"
            text={loading ? 'Signing in...' : 'Sign In'}
            stylingMode="contained"
            disabled={loading || !formValid}
            // DevExtreme ClickEvent => call handler without needing event typing
            onClick={() => { void handleSubmit(); }}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white"
          />
          {/* Hidden native submit button for accessibility / Enter key */}
          <button type="submit" className="hidden" aria-hidden="true" />
          {!formValid && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center">Fill required fields correctly to enable sign in.</div>
          )}
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

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-slate-400">Loading...</div>}>
      <LoginInner />
    </Suspense>
  );
}