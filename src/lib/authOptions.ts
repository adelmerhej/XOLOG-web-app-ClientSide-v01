import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { UserModel } from '@/models/UserModel';
import { connectToDatabase } from '@/lib/mongoose';
import { newSession } from '@/lib/session.server';
import { ObjectId } from 'mongodb';
import type { DefaultSession, User as NextAuthUser } from 'next-auth';

// Module augmentation stays colocated so other imports rely on proper typing.
declare module 'next-auth' {
  interface Session {
    user: {
      _id: string;
      userId?: number;
      role?: string;
      apiToken?: string;
      sessionToken?: string;
      sessionCreatedAt?: number;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    userId?: number;
    role?: string;
    apiToken?: string;
    sessionToken?: string;
    sessionCreatedAt?: number;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Username or Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials.password) return null;
        await connectToDatabase();
        const identifier = credentials.identifier.trim();
        const lookup = identifier.includes('@')
          ? { email: identifier.toLowerCase() }
          : { username: identifier };

        const userDoc = await UserModel.findOne(lookup).select('+password username email role userId');
        if (!userDoc) return null;
        const isValid = await compare(credentials.password, userDoc.password);
        if (!isValid) return null;

        interface SafeUser extends NextAuthUser { role?: string; username?: string; userId?: number; apiToken?: string }
        const safeUser: SafeUser = {
          id: (userDoc._id as unknown as { toString(): string }).toString(),
            name: userDoc.username,
            email: userDoc.email,
            role: userDoc.role,
            userId: userDoc.userId,
        };
        try {
          const apiBase = process.env.REACT_APP_API_URL;
          if (apiBase) {
            const apiRes = await fetch(`${apiBase}/api/v1/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userDoc.email, password: credentials.password }),
            });
            if (apiRes.ok) {
              const body = (await apiRes.json()) as { token?: string };
              if (body?.token) safeUser.apiToken = body.token;
            }
          }
        } catch {
          // Continue without apiToken
        }
        return safeUser;
      },
    }),
  ],
  pages: { signIn: '/auth/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as NextAuthUser & { role?: string };
        token.id = u.id;
        token.role = u.role;
        const maybeUserId = (user as { userId?: number }).userId;
        if (typeof maybeUserId === 'number') token.userId = maybeUserId;
        const maybeApiToken = (user as { apiToken?: string }).apiToken;
        if (typeof maybeApiToken === 'string') token.apiToken = maybeApiToken;
        const sessionObj = newSession(new ObjectId(token.id as string));
        token.sessionToken = sessionObj.token;
        token.sessionCreatedAt = sessionObj.createdAt;
      } else {
        const oneHour = 60 * 60 * 1000;
        if (token.sessionCreatedAt && Date.now() - token.sessionCreatedAt > oneHour) {
          const sessionObj = newSession(new ObjectId(token.id as string));
          token.sessionToken = sessionObj.token;
          token.sessionCreatedAt = sessionObj.createdAt;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user._id = String(token.id);
        session.user.role = token.role as string | undefined;
        if (typeof token.userId === 'number') session.user.userId = token.userId;
        if (typeof token.apiToken === 'string') session.user.apiToken = token.apiToken;
        session.user.sessionToken = token.sessionToken;
        session.user.sessionCreatedAt = token.sessionCreatedAt;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
