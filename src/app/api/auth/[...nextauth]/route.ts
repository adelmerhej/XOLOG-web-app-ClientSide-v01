import NextAuth, { DefaultSession, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { UserModel } from "@/models/UserModel";
import { connectToDatabase } from "@/lib/mongoose";
import { newSession } from "@/lib/session.server";
import { ObjectId } from "mongodb";
// Note: Removed MongoDBAdapter usage since we're directly using the Mongoose model.

declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      role?: string;
      sessionToken?: string;
      sessionCreatedAt?: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    sessionToken?: string;
    sessionCreatedAt?: number;
  }
}

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials.password) return null;
        await connectToDatabase();
        // Determine whether identifier is email (contains @)
        const identifier = credentials.identifier.trim();
        const lookup = identifier.includes('@')
          ? { email: identifier.toLowerCase() }
          : { username: identifier };
        const userDoc = await UserModel.findOne(lookup).select("+password username email role");
        if (!userDoc) return null;

        console.log("User found:", credentials.password, userDoc.password);

        const isValid = await compare(credentials.password, userDoc.password);
        if (!isValid) return null;
        interface SafeUser extends NextAuthUser { role?: string; username?: string; }
        const safeUser: SafeUser = {
          id: (userDoc._id as unknown as { toString(): string }).toString(),
          name: userDoc.username,
          email: userDoc.email,
          role: userDoc.role,
        };
        return safeUser;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign in attach id/role and create custom session token
      if (user) {
        const u = user as NextAuthUser & { role?: string };
        token.id = u.id;
        token.role = u.role;
        // Generate a custom session token only at sign in
        const sessionObj = newSession(new ObjectId(token.id as string));
        token.sessionToken = sessionObj.token;
        token.sessionCreatedAt = sessionObj.createdAt;
      } else {
        // Optionally rotate token if older than 1h (matching COOKIE_MAX_AGE in session.server.ts)
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
        session.user.sessionToken = token.sessionToken;
        session.user.sessionCreatedAt = token.sessionCreatedAt;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
