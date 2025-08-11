import { NextResponse } from 'next/server';
//import { connectToDatabase } from '@/lib/dbUtils';
import { UserModel } from '@/models/UserModel';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, password } = body;
    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    //await connectToDatabase();
    const exists = await UserModel.findOne({ $or: [{ username }, { email }] });
    if (exists) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }
    const user = await UserModel.create({ username, email, password });
    return NextResponse.json({ id: user._id, username: user.username });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
