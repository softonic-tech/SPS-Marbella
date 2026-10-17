import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { publicOrigin } from '@/lib/social/env';

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

async function handle(request: Request) {
  const origin = publicOrigin(new URL(request.url).origin);
  const code = randomUUID().replace(/-/g, '').slice(0, 16);
  console.log('[instagram] data deletion callback', code);
  return NextResponse.json({
    url: `${origin}/admin?ig=data-deletion&code=${code}`,
    confirmation_code: code,
  });
}
