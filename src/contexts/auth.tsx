"use client";

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from 'next-auth/react';
import type { AuthContextType, User } from '@/utils/types';

// Backward compatible context using next-auth session underneath
const AuthContext = createContext<AuthContextType>({ loading: false } as AuthContextType);

function AuthProvider(props: React.PropsWithChildren<unknown>) {
  const { data: session, status } = useSession();

  const loading = status === 'loading';
  // Map next-auth session.user to legacy User type
  const mappedUser: User | undefined = useMemo(() => {
    if (!session?.user) return undefined;
    return {
      name: session.user.name || '',
      email: session.user.email || '',
      token: (session.user as { apiToken?: string }).apiToken || (session.user as { token?: string }).token,
      userId: (session.user as { userId?: number }).userId,
      avatarUrl: '/user.jpg', // could be extended later
    };
  }, [session]);

  const signIn = useCallback(async(email: string, password: string) => {
    // Delegate to next-auth credentials provider
    const result = await nextAuthSignIn('credentials', {
      redirect: false,
      identifier: email,
      password,
    });
    if (result?.error) {
      return { isOk: false, message: result.error };
    }
    return { isOk: true, data: mappedUser };
  }, [mappedUser]);

  const signOut = useCallback(() => {
    void nextAuthSignOut({ redirect: false });
  }, []);

  const value: AuthContextType = useMemo(() => ({
    user: mappedUser,
    signIn,
    signOut,
    loading,
  }), [mappedUser, signIn, signOut, loading]);

  return <AuthContext.Provider value={value} {...props} />;
}

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth }; 
