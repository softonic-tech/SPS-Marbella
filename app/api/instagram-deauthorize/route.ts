import { NextResponse } from 'next/server';

export async function POST() {
  console.log('[instagram] deauthorize callback received');
  return NextResponse.json({ ok: true });
}
