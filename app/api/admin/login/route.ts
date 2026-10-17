import { NextResponse } from 'next/server';
import { setAdminSession, verifyAdminPassword } from '@/lib/social/auth';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { password?: string };
  const password = String(body.password || '');
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ ok: false, error: 'Incorrect password.' }, { status: 401 });
  }
  await setAdminSession();
  return NextResponse.json({ ok: true });
}
