import { NextResponse } from 'next/server';
import { publicOrigin } from '@/lib/social/env';
import { completeInstagramOAuth, instagramRedirectUri, verifyOAuthState } from '@/lib/social/meta';
import { readSocial, writeSocial } from '@/lib/social/store';

function originFrom(request: Request) {
  return publicOrigin(new URL(request.url).origin);
}

function adminRedirect(origin: string, query: string) {
  return `${origin}/admin?${query}`;
}

async function handle(request: Request, method: 'GET' | 'POST') {
  const origin = originFrom(request);
  const url = new URL(request.url);
  const body =
    method === 'POST'
      ? ((await request.json().catch(() => ({}))) as Record<string, string>)
      : Object.fromEntries(url.searchParams.entries());

  const fail = async (message: string) => {
    console.error('[instagram] callback failed:', message);
    const current = await readSocial();
    await writeSocial({ ...current, instagramLastError: message });
    if (method === 'POST') {
      return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }
    return NextResponse.redirect(adminRedirect(origin, `ig=error&msg=${encodeURIComponent(message)}`));
  };

  const error = String(body.error_description || body.error_reason || body.error || '').trim();
  if (error) return fail(error);

  const state = String(body.state || '').trim();
  const code = String(body.code || '').trim();
  if (!verifyOAuthState(state)) return fail('Invalid or expired login state. Click Connect Instagram again.');
  if (!code) return fail('Missing Instagram code. Open Admin via your HTTPS BASE_URL, then Connect again.');

  try {
    console.log('[instagram] callback', { origin, redirectUri: instagramRedirectUri(origin) });
    const config = await completeInstagramOAuth(code, origin, await readSocial());
    await writeSocial(config);
    const saved = await readSocial();
    if (!saved.instagramToken) return fail('Instagram token was not saved to storage.');
    console.log('[instagram] connected', saved.instagramUserId, saved.instagramUsername);
    if (method === 'POST') {
      return NextResponse.json({
        ok: true,
        userId: saved.instagramUserId,
        username: saved.instagramUsername,
      });
    }
    const msg = encodeURIComponent(
      saved.instagramUsername ? `Connected @${saved.instagramUsername}` : 'Instagram connected',
    );
    return NextResponse.redirect(adminRedirect(origin, `ig=connected&msg=${msg}`));
  } catch (caught) {
    return fail(caught instanceof Error ? caught.message : 'Instagram connect failed');
  }
}

export async function GET(request: Request) {
  return handle(request, 'GET');
}

export async function POST(request: Request) {
  return handle(request, 'POST');
}
