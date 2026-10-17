import { NextResponse } from 'next/server';
import { publicOrigin } from '@/lib/social/env';
import { completeFacebookOAuth, facebookRedirectUri, verifyOAuthState } from '@/lib/social/meta';
import { readSocial, writeSocial } from '@/lib/social/store';

function originFrom(request: Request) {
  return publicOrigin(new URL(request.url).origin);
}

export async function POST(request: Request) {
  const origin = originFrom(request);
  const body = (await request.json().catch(() => ({}))) as {
    code?: string;
    state?: string;
    error?: string;
    error_description?: string;
  };

  const fail = async (message: string) => {
    console.error('[facebook] callback failed:', message);
    const current = await readSocial();
    await writeSocial({ ...current, lastError: message });
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  };

  const error = String(body.error_description || body.error || '').trim();
  if (error) return fail(error);

  const state = String(body.state || '').trim();
  const code = String(body.code || '').trim();
  if (!verifyOAuthState(state)) return fail('Invalid or expired login state. Click Connect Facebook again.');
  if (!code) return fail('Missing Facebook code. Open Admin via your HTTPS BASE_URL, then Connect again.');

  try {
    console.log('[facebook] callback', { origin, redirectUri: facebookRedirectUri(origin) });
    const current = await readSocial();
    const facebook = await completeFacebookOAuth(code, origin);
    await writeSocial({
      ...current,
      ...facebook,
      instagramUserId: current.instagramUserId,
      instagramUsername: current.instagramUsername,
      instagramToken: current.instagramToken,
      instagramTokenExpiresAt: current.instagramTokenExpiresAt,
      instagramConnectedAt: current.instagramConnectedAt,
      instagramLastError: current.instagramLastError,
    });
    const saved = await readSocial();
    if (!saved.pageToken) return fail('Token was not saved to storage.');
    console.log('[facebook] connected', saved.pageId, saved.pageName);
    return NextResponse.json({ ok: true, pageId: saved.pageId, pageName: saved.pageName });
  } catch (caught) {
    return fail(caught instanceof Error ? caught.message : 'Facebook connect failed');
  }
}
