import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/social/auth';
import { storageMode } from '@/lib/social/store';

export async function GET() {
  const ok = await isAdminAuthenticated();
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, storage: storageMode() });
}
