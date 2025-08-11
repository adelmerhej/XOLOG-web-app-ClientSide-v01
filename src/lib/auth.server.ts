import { AuthOptions, User as NextAuthUser } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
//import { connectToDatabase } from './dbUtils';
import { UserModel } from '@/models/UserModel';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
	session: { strategy: 'jwt' },
		pages: { signIn: '/auth/login' },
	providers: [
		Credentials({
			name: 'Credentials',
			credentials: {
				username: { label: 'Username', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.username || !credentials.password) return null;
				//await connectToDatabase();
				const user = await UserModel.findOne({ username: credentials.username });
				if (!user) return null;
				const valid = await bcrypt.compare(credentials.password, user.password);
				if (!valid) return null;
		const doc = user as unknown as { _id: { toString(): string }; username: string; role: string };
		return { id: doc._id.toString(), name: doc.username, role: doc.role } as NextAuthUser & { role: string };
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
			token.role = (user as NextAuthUser & { role?: string }).role;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
			(session.user as NextAuthUser & { role?: string }).role = token.role as string | undefined;
			}
			return session;
		},
	},
};

