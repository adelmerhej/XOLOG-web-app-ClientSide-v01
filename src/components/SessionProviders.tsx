"use client";
import { SessionProvider } from 'next-auth/react';
import React from 'react';
import { AuthProvider } from '@/contexts/auth';

export default function SessionProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}
