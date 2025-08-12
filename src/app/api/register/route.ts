import { NextResponse } from 'next/server';
import { UserModel } from '@/models/UserModel';
import { connectToDatabase } from '@/lib/mongoose';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { username, email, password } = body ?? {};

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Basic server-side format checks (mirroring model) to give clearer feedback
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      return NextResponse.json({ error: 'Invalid username format' }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const exists = await UserModel.findOne({ $or: [{ username }, { email }] });
    if (exists) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    try {
      const user = await UserModel.create({ username, email, password });

      console.log('New user registered:', user._id);

      return NextResponse.json({ id: user._id, username: user.username });
    } catch (err: unknown) {
      interface MongoErr { code?: number; name?: string; }
      const me = err as MongoErr;
      if (me.code === 11000) {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 });
      }
      if (me.name === 'ValidationError') {
        // Extract individual field messages
        const details: Record<string, string> = {};
        const anyErr = err as unknown as { errors?: Record<string, { message?: string }> };
        if (anyErr.errors) {
          for (const [field, info] of Object.entries(anyErr.errors)) {
            if (info && info.message) details[field] = info.message;
          }
        }
        return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
      }
      console.error('Registration unexpected error:', err);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  } catch (outer) {
    console.error('Registration handler failure:', outer);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
