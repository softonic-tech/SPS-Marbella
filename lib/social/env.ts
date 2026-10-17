const SITE_FALLBACK = 'https://spsmarbella.com';

export function env(name: string) {
  return (process.env[name] ?? '').trim();
}

export function envAny(...names: string[]) {
  for (const name of names) {
    const value = env(name);
    if (value) return value;
  }
  return '';
}

export function metaAppId() {
  return envAny('META_APP_ID', 'FACEBOOK_APP_ID');
}

export function metaAppSecret() {
  return envAny('META_APP_SECRET', 'FACEBOOK_APP_SECRET');
}

export function graphVersion() {
  const raw = envAny('META_GRAPH_VERSION', 'FACEBOOK_GRAPH_VERSION') || 'v26.0';
  return raw.startsWith('v') ? raw : `v${raw}`;
}

export function graphBase() {
  return `https://graph.facebook.com/${graphVersion()}`;
}

export function igGraphBase() {
  return `https://graph.instagram.com/${graphVersion()}`;
}

export function dialogBase() {
  return `https://www.facebook.com/${graphVersion()}/dialog/oauth`;
}

export function instagramAppId() {
  return envAny('INSTAGRAM_APP_ID', 'IG_APP_ID');
}

export function instagramAppSecret() {
  return envAny('INSTAGRAM_APP_SECRET', 'IG_APP_SECRET');
}

/** Prefer BASE_URL so redirect_uri always matches Meta settings. */
export function publicOrigin(fallback = SITE_FALLBACK) {
  const base = env('BASE_URL').replace(/\/$/, '');
  if (base) return base;
  const site = env('NEXT_PUBLIC_SITE_URL').replace(/\/$/, '');
  return site || fallback.replace(/\/$/, '');
}

export function facebookAppReady() {
  return Boolean(metaAppId() && metaAppSecret());
}

export function instagramAppReady() {
  return Boolean(instagramAppId() && instagramAppSecret());
}

export function adminPassword() {
  return env('ADMIN_PASSWORD') || 'sps-admin';
}

export function sessionSecret() {
  return envAny('SESSION_SECRET', 'META_APP_SECRET', 'FACEBOOK_APP_SECRET', 'ADMIN_PASSWORD') || 'sps-marbella';
}

/**
 * Comma-separated Facebook user IDs allowed to connect.
 * Empty = any user Meta lets through (testers in Development, anyone after Live).
 * Also reads singular ALLOWED_FACEBOOK_USER_ID for mm-properties compatibility.
 */
export function allowedFacebookUserIds(): string[] {
  const multi = env('ALLOWED_FACEBOOK_USER_IDS');
  const single = env('ALLOWED_FACEBOOK_USER_ID');
  const raw = [multi, single].filter(Boolean).join(',');
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

export function allowedInstagramUserIds(): string[] {
  const multi = env('ALLOWED_INSTAGRAM_USER_IDS');
  const single = env('ALLOWED_INSTAGRAM_USER_ID');
  const raw = [multi, single].filter(Boolean).join(',');
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}
