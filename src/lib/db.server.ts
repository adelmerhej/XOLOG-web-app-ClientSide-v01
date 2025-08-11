import mongoose from 'mongoose';

type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = global as any;
let cached: MongooseCache = globalAny._mongooseCached as MongooseCache;
if (!cached) {
	cached = { conn: null, promise: null };
	globalAny._mongooseCached = cached;
}

export async function connectToDatabase() {
	if (cached.conn) return cached.conn;
	if (!process.env.MONGODB_URI) {
		throw new Error('MONGODB_URI not set');
	}
	if (!cached.promise) {
		cached.promise = mongoose
			.connect(process.env.MONGODB_URI, {
				dbName: process.env.MONGODB_DB || undefined,
			})
			.then((m) => m);
	}
	cached.conn = await cached.promise;
	return cached.conn;
}
