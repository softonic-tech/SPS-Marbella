import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  allowedFacebookUserIds,
  allowedInstagramUserIds,
  dialogBase,
  facebookAppReady,
  graphBase,
  igGraphBase,
  instagramAppId,
  instagramAppReady,
  instagramAppSecret,
  metaAppId,
  metaAppSecret,
  publicOrigin,
  sessionSecret,
  env,
} from './env';
import type { FacebookPage, SocialConfig } from './types';
import { emptySocialConfig } from './types';

const FB_SCOPES = ['public_profile', 'pages_show_list', 'pages_read_engagement', 'pages_manage_posts'].join(',');
const IG_SCOPES = [
  'instagram_business_basic',
  'instagram_business_content_publish',
  'instagram_business_manage_comments',
  'instagram_business_manage_messages',
  'instagram_business_manage_insights',
].join(',');

export function createOAuthState() {
  const exp = String(Date.now() + 15 * 60 * 1000);
  const sig = createHmac('sha256', sessionSecret()).update(exp).digest('hex').slice(0, 40);
  return Buffer.from(`${exp}.${sig}`).toString('base64url');
}

export function verifyOAuthState(state: string) {
  try {
    const raw = Buffer.from(state, 'base64url').toString('utf8');
    const [exp, sig] = raw.split('.');
    if (!exp || !sig) return false;
    if (Date.now() > Number(exp)) return false;
    const expected = createHmac('sha256', sessionSecret()).update(exp).digest('hex').slice(0, 40);
    const left = Buffer.from(sig);
    const right = Buffer.from(expected);
    return left.length === right.length && timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export function facebookRedirectUri(origin?: string) {
  return `${publicOrigin(origin)}/facebook-callback.html`;
}

export function instagramRedirectUri(origin?: string) {
  const override = env('INSTAGRAM_REDIRECT_URI').replace(/\/$/, '');
  if (override) return override;
  return `${publicOrigin(origin)}/api/instagram-callback`;
}

export function instagramDeauthorizeUri(origin?: string) {
  return `${publicOrigin(origin)}/api/instagram-deauthorize`;
}

export function instagramDataDeletionUri(origin?: string) {
  return `${publicOrigin(origin)}/api/instagram-data-deletion`;
}

export function buildFacebookAuthUrl(origin: string, state: string) {
  const params = new URLSearchParams({
    client_id: metaAppId(),
    redirect_uri: facebookRedirectUri(origin),
    state,
    response_type: 'code',
  });
  const configId = env('META_LOGIN_CONFIG_ID');
  if (configId) params.set('config_id', configId);
  else params.set('scope', FB_SCOPES);
  return `${dialogBase()}?${params}`;
}

export function buildInstagramAuthUrl(origin: string, state: string) {
  const redirectUri = instagramRedirectUri(origin);
  const params = new URLSearchParams({
    client_id: instagramAppId(),
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: IG_SCOPES,
    state,
  });
  console.log('[instagram] authorize redirect_uri=', redirectUri, 'client_id=', instagramAppId());
  return `https://www.instagram.com/oauth/authorize?${params}`;
}

export function resolveFacebookCreds(config: SocialConfig) {
  if (config.pageId && config.pageToken) {
    return { pageId: config.pageId, pageToken: config.pageToken, pageName: config.pageName, source: 'db' as const };
  }
  const pageId = env('FACEBOOK_PAGE_ID');
  const pageToken = env('FACEBOOK_PAGE_ACCESS_TOKEN');
  if (pageId && pageToken) {
    return { pageId, pageToken, pageName: 'Env page', source: 'env' as const };
  }
  return null;
}

export function resolveInstagram(config: SocialConfig) {
  const userId = (config.instagramUserId || '').trim();
  const token = (config.instagramToken || '').trim();
  if (!userId || !token) return null;
  return {
    userId,
    username: (config.instagramUsername || '').trim(),
    accessToken: token,
  };
}

export function socialStatus(config: SocialConfig) {
  const creds = resolveFacebookCreds(config);
  const ig = resolveInstagram(config);
  return {
    ok: true as const,
    facebook: Boolean(creds),
    instagram: Boolean(ig),
    oauth: facebookAppReady(),
    instagramOauth: instagramAppReady(),
    pageId: creds?.pageId ? 'connected' : '',
    pageName: creds?.pageName || '',
    source: creds?.source || '',
    connectedAt: config.connectedAt || '',
    pages: config.pages.map((page) => ({ id: page.id, name: page.name })),
    selectedPageId: config.pageId || '',
    hasToken: Boolean(creds?.pageToken),
    facebookUserId: config.facebookUserId || '',
    instagramUserId: ig?.userId ? 'connected' : '',
    instagramUsername: ig?.username || '',
    instagramConnectedAt: config.instagramConnectedAt || '',
    redirectUri: facebookRedirectUri(),
    instagramRedirectUri: instagramRedirectUri(),
    instagramDeauthorizeUri: instagramDeauthorizeUri(),
    instagramDataDeletionUri: instagramDataDeletionUri(),
    lastError: config.lastError || '',
    instagramLastError: config.instagramLastError || '',
    storageHint: env('MONGODB_URI') ? 'mongodb' : 'file',
  };
}

export function clearInstagramLogin(config: SocialConfig): SocialConfig {
  return {
    ...config,
    instagramUserId: '',
    instagramUsername: '',
    instagramToken: '',
    instagramTokenExpiresAt: '',
    instagramConnectedAt: '',
    instagramLastError: '',
  };
}

export function selectFacebookPage(config: SocialConfig, pageId: string): SocialConfig | null {
  const page = config.pages.find((item) => item.id === pageId);
  if (!page) return null;
  return {
    ...config,
    pageId: page.id,
    pageName: page.name,
    pageToken: page.accessToken,
  };
}

async function exchangeFacebookCode(code: string, origin: string) {
  const params = new URLSearchParams({
    client_id: metaAppId(),
    client_secret: metaAppSecret(),
    redirect_uri: facebookRedirectUri(origin),
    code,
  });
  const response = await fetch(`${graphBase()}/oauth/access_token?${params}`);
  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message?: string };
  };
  if (!response.ok || !data.access_token) {
    throw new Error(data.error?.message || 'Could not exchange Facebook code.');
  }
  return data;
}

async function longLivedUserToken(shortToken: string) {
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: metaAppId(),
    client_secret: metaAppSecret(),
    fb_exchange_token: shortToken,
  });
  const response = await fetch(`${graphBase()}/oauth/access_token?${params}`);
  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message?: string };
  };
  if (!response.ok || !data.access_token) {
    return { accessToken: shortToken, expiresIn: 0 };
  }
  return { accessToken: data.access_token, expiresIn: Number(data.expires_in) || 0 };
}

async function fetchFacebookMe(userToken: string) {
  const response = await fetch(
    `${graphBase()}/me?fields=id,name&access_token=${encodeURIComponent(userToken)}`,
  );
  const data = (await response.json()) as { id?: string; name?: string; error?: { message?: string } };
  if (!response.ok || !data.id) {
    throw new Error(data.error?.message || 'Could not verify the Facebook user.');
  }
  return { id: data.id, name: String(data.name || '') };
}

async function assertAllowedFacebookUser(userId: string) {
  const allowed = allowedFacebookUserIds();
  if (!allowed.length) return;
  if (!allowed.includes(userId)) {
    throw new Error(
      `This Facebook account (${userId}) is not allowed. Add it to ALLOWED_FACEBOOK_USER_IDS or clear that variable.`,
    );
  }
}

function mapPages(rows: { id?: string; name?: string; access_token?: string }[] | undefined): FacebookPage[] {
  return (rows ?? [])
    .map((page) => ({
      id: String(page.id ?? '').trim(),
      name: String(page.name ?? 'Page').trim(),
      accessToken: String(page.access_token ?? '').trim(),
    }))
    .filter((page) => page.id && page.accessToken);
}

export async function fetchFacebookPages(userToken: string): Promise<FacebookPage[]> {
  const params = new URLSearchParams({
    fields: 'id,name,access_token',
    access_token: userToken,
  });
  const response = await fetch(`${graphBase()}/me/accounts?${params}`);
  const data = (await response.json()) as {
    data?: { id?: string; name?: string; access_token?: string }[];
    error?: { message?: string };
  };
  if (response.ok && !data.error) {
    const pages = mapPages(data.data);
    if (pages.length > 0) return pages;
  }

  const nested = new URLSearchParams({
    fields: 'accounts{id,name,access_token}',
    access_token: userToken,
  });
  const nestedRes = await fetch(`${graphBase()}/me?${nested}`);
  const nestedData = (await nestedRes.json()) as {
    accounts?: { data?: { id?: string; name?: string; access_token?: string }[] };
    error?: { message?: string };
  };
  const pages = mapPages(nestedData.accounts?.data);
  if (pages.length > 0) return pages;

  const message = data.error?.message || nestedData.error?.message || 'Could not load Facebook Pages.';
  throw new Error(
    `${message} Grant Page access (pages_show_list / pages_manage_posts) and make sure this user is a Page admin.`,
  );
}

export async function completeFacebookOAuth(code: string, origin: string): Promise<SocialConfig> {
  const short = await exchangeFacebookCode(code, publicOrigin(origin));
  const longLived = await longLivedUserToken(short.access_token!);
  const me = await fetchFacebookMe(longLived.accessToken);
  await assertAllowedFacebookUser(me.id);
  const pages = await fetchFacebookPages(longLived.accessToken);
  if (pages.length === 0) {
    throw new Error('No Facebook Pages found. Make sure this Facebook user is a Page admin.');
  }
  const selected = pages[0];
  const expiresAt =
    longLived.expiresIn > 0
      ? new Date(Date.now() + longLived.expiresIn * 1000).toISOString()
      : '';
  return {
    ...emptySocialConfig(),
    pageId: selected.id,
    pageName: selected.name,
    pageToken: selected.accessToken,
    pages,
    connectedAt: new Date().toISOString(),
    lastError: '',
    facebookUserId: me.id,
    facebookUserToken: longLived.accessToken,
    facebookTokenExpiresAt: expiresAt,
  };
}

async function exchangeInstagramCode(code: string, origin: string) {
  const body = new URLSearchParams({
    client_id: instagramAppId(),
    client_secret: instagramAppSecret(),
    grant_type: 'authorization_code',
    redirect_uri: instagramRedirectUri(origin),
    code,
  });
  const response = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = (await response.json()) as {
    access_token?: string;
    user_id?: string | number;
    data?: { access_token?: string; user_id?: string | number }[];
    error_message?: string;
    error?: { message?: string };
  };
  const short = data.access_token || data.data?.[0]?.access_token || '';
  const userId = String(data.user_id ?? data.data?.[0]?.user_id ?? '').trim();
  if (!response.ok || !short) {
    throw new Error(data.error?.message || data.error_message || 'Could not exchange Instagram authorization code.');
  }
  return { accessToken: short, userId };
}

async function longLivedInstagramToken(shortToken: string) {
  const params = new URLSearchParams({
    grant_type: 'ig_exchange_token',
    client_secret: instagramAppSecret(),
    access_token: shortToken,
  });
  const getRes = await fetch(`${igGraphBase()}/access_token?${params}`);
  const getData = (await getRes.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message?: string };
  };
  if (getRes.ok && getData.access_token) {
    return { accessToken: getData.access_token, expiresIn: Number(getData.expires_in) || 60 * 24 * 3600 };
  }

  const postRes = await fetch(`${igGraphBase()}/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  const postData = (await postRes.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message?: string };
  };
  if (postRes.ok && postData.access_token) {
    return { accessToken: postData.access_token, expiresIn: Number(postData.expires_in) || 60 * 24 * 3600 };
  }
  return { accessToken: shortToken, expiresIn: 3600 };
}

async function fetchInstagramProfile(accessToken: string) {
  const params = new URLSearchParams({
    fields: 'user_id,username,account_type',
    access_token: accessToken,
  });
  const response = await fetch(`${igGraphBase()}/me?${params}`);
  const data = (await response.json()) as {
    user_id?: string | number;
    id?: string | number;
    username?: string;
    error?: { message?: string };
  };
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || 'Could not load the Instagram profile.');
  }
  const userId = String(data.user_id ?? data.id ?? '').trim();
  if (!userId) throw new Error('Instagram did not return a user id.');
  return { userId, username: String(data.username ?? '').trim() };
}

export async function completeInstagramOAuth(
  code: string,
  origin: string,
  current: SocialConfig,
): Promise<SocialConfig> {
  if (!instagramAppReady()) {
    throw new Error('Set INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET first.');
  }
  const exchanged = await exchangeInstagramCode(code, publicOrigin(origin));
  const longLived = await longLivedInstagramToken(exchanged.accessToken);
  const profile = await fetchInstagramProfile(longLived.accessToken);
  const userId = profile.userId || exchanged.userId;
  if (!userId) throw new Error('Instagram login did not return a user id.');

  const allowed = allowedInstagramUserIds();
  if (allowed.length && !allowed.includes(userId)) {
    throw new Error(
      `This Instagram account (${userId}) is not allowed. Add it to ALLOWED_INSTAGRAM_USER_IDS or clear that variable.`,
    );
  }

  const expiresAt =
    longLived.expiresIn > 0
      ? new Date(Date.now() + longLived.expiresIn * 1000).toISOString()
      : '';

  return {
    ...current,
    instagramUserId: userId,
    instagramUsername: profile.username,
    instagramToken: longLived.accessToken,
    instagramTokenExpiresAt: expiresAt,
    instagramConnectedAt: new Date().toISOString(),
    instagramLastError: '',
  };
}

/** Refresh Instagram long-lived token when it expires within 7 days. */
export async function refreshInstagramTokenIfNeeded(config: SocialConfig): Promise<SocialConfig> {
  const token = (config.instagramToken || '').trim();
  if (!token) return config;

  const expiresAt = Date.parse(config.instagramTokenExpiresAt || '');
  const needsRefresh = !Number.isFinite(expiresAt) || expiresAt - Date.now() < 7 * 24 * 60 * 60 * 1000;
  if (!needsRefresh) return config;

  const params = new URLSearchParams({
    grant_type: 'ig_refresh_token',
    access_token: token,
  });
  const response = await fetch(`${igGraphBase()}/refresh_access_token?${params}`);
  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message?: string };
  };
  if (!response.ok || !data.access_token) {
    console.warn('[instagram] token refresh skipped:', data.error?.message || response.status);
    return config;
  }
  return {
    ...config,
    instagramToken: data.access_token,
    instagramTokenExpiresAt:
      data.expires_in && data.expires_in > 0
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : config.instagramTokenExpiresAt,
  };
}

async function waitForInstagramContainer(creationId: string, accessToken: string) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const params = new URLSearchParams({
      fields: 'status_code,status',
      access_token: accessToken,
    });
    const response = await fetch(`${igGraphBase()}/${encodeURIComponent(creationId)}?${params}`);
    const data = (await response.json()) as {
      status_code?: string;
      status?: string;
      error?: { message?: string };
    };
    if (!response.ok || data.error) {
      throw new Error(data.error?.message || `Instagram container check failed (${response.status}).`);
    }
    const code = String(data.status_code || '').toUpperCase();
    if (code === 'FINISHED' || code === 'PUBLISHED') return;
    if (code === 'ERROR' || code === 'EXPIRED') {
      throw new Error(data.status || `Instagram media container status: ${code || 'ERROR'}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error('Instagram is still processing the photo. Try again in a moment.');
}

export async function publishFacebook(
  input: { message: string; image?: string; link?: string; withPhoto?: boolean },
  config: SocialConfig,
) {
  const creds = resolveFacebookCreds(config);
  if (!creds) {
    return { ok: false as const, error: 'Facebook is not connected. Use Connect Facebook in Admin → Social.' };
  }

  const message = input.message.trim().slice(0, 2200);
  if (message.length < 8) return { ok: false as const, error: 'Write a longer post before publishing.' };

  const link = (input.link || '').trim().slice(0, 500);
  const image = (input.image || '').trim().slice(0, 1000);
  const withPhoto = input.withPhoto !== false && /^https:\/\//i.test(image);

  const endpoint = withPhoto
    ? `${graphBase()}/${encodeURIComponent(creds.pageId)}/photos`
    : `${graphBase()}/${encodeURIComponent(creds.pageId)}/feed`;

  const body = new URLSearchParams();
  body.set('access_token', creds.pageToken);
  if (withPhoto) {
    body.set('url', image);
    body.set('caption', message);
  } else {
    body.set('message', message);
    if (/^https:\/\//i.test(link)) body.set('link', link);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = (await response.json()) as { id?: string; post_id?: string; error?: { message?: string } };
  if (!response.ok || data.error) {
    return { ok: false as const, error: data.error?.message || `Facebook returned ${response.status}.` };
  }
  return {
    ok: true as const,
    id: data.id || data.post_id || '',
    mode: withPhoto ? 'photo' : 'feed',
    pageName: creds.pageName,
  };
}

export async function publishInstagram(
  input: { message: string; image: string },
  config: SocialConfig,
) {
  const ig = resolveInstagram(config);
  if (!ig) {
    return { ok: false as const, error: 'Instagram is not connected. Use Connect Instagram in Admin → Social.' };
  }

  const message = input.message.trim().slice(0, 2200);
  if (message.length < 8) return { ok: false as const, error: 'Write a longer caption before publishing.' };

  const image = input.image.trim().slice(0, 1000);
  if (!/^https:\/\//i.test(image)) {
    return {
      ok: false as const,
      error: 'Instagram requires a public https image URL. Upload a project image first.',
    };
  }

  const createBody = new URLSearchParams({
    image_url: image,
    caption: message,
    access_token: ig.accessToken,
  });
  const createRes = await fetch(`${igGraphBase()}/${encodeURIComponent(ig.userId)}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: createBody,
  });
  const createData = (await createRes.json()) as { id?: string; error?: { message?: string } };
  if (!createRes.ok || createData.error || !createData.id) {
    return {
      ok: false as const,
      error: createData.error?.message || `Instagram media create failed (${createRes.status}).`,
    };
  }

  try {
    await waitForInstagramContainer(createData.id, ig.accessToken);
  } catch (caught) {
    return {
      ok: false as const,
      error: caught instanceof Error ? caught.message : 'Instagram media processing failed.',
    };
  }

  const publishBody = new URLSearchParams({
    creation_id: createData.id,
    access_token: ig.accessToken,
  });
  const publishRes = await fetch(`${igGraphBase()}/${encodeURIComponent(ig.userId)}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: publishBody,
  });
  const publishData = (await publishRes.json()) as { id?: string; error?: { message?: string } };
  if (!publishRes.ok || publishData.error) {
    return {
      ok: false as const,
      error: publishData.error?.message || `Instagram publish failed (${publishRes.status}).`,
    };
  }

  return {
    ok: true as const,
    id: publishData.id || '',
    mode: 'photo',
    username: ig.username,
  };
}
