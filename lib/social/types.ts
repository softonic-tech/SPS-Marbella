export type FacebookPage = {
  id: string;
  name: string;
  accessToken: string;
};

export type SocialConfig = {
  pageId: string;
  pageName: string;
  pageToken: string;
  pages: FacebookPage[];
  connectedAt: string;
  lastError?: string;
  /** Facebook user who completed OAuth (for allowlist / audit). */
  facebookUserId?: string;
  facebookUserToken?: string;
  facebookTokenExpiresAt?: string;

  instagramUserId?: string;
  instagramUsername?: string;
  instagramToken?: string;
  instagramTokenExpiresAt?: string;
  instagramConnectedAt?: string;
  instagramLastError?: string;
};

export type UploadedAsset = {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  createdAt: string;
  /** Absolute public URL when known. */
  url?: string;
};

export type ProjectDraft = {
  id: string;
  title: string;
  description: string;
  imageId: string;
  imageUrl: string;
  createdAt: string;
  lastPostedAt?: string;
  lastFacebookId?: string;
  lastInstagramId?: string;
};

export function emptySocialConfig(): SocialConfig {
  return {
    pageId: '',
    pageName: '',
    pageToken: '',
    pages: [],
    connectedAt: '',
    lastError: '',
    facebookUserId: '',
    facebookUserToken: '',
    facebookTokenExpiresAt: '',
    instagramUserId: '',
    instagramUsername: '',
    instagramToken: '',
    instagramTokenExpiresAt: '',
    instagramConnectedAt: '',
    instagramLastError: '',
  };
}

export function parseSocialConfig(raw: string | null): SocialConfig {
  if (!raw) return emptySocialConfig();
  try {
    const value = JSON.parse(raw) as Partial<SocialConfig>;
    const pages = Array.isArray(value.pages)
      ? value.pages
          .map((page) => ({
            id: String(page?.id ?? '').trim(),
            name: String(page?.name ?? '').trim(),
            accessToken: String(page?.accessToken ?? '').trim(),
          }))
          .filter((page) => page.id && page.accessToken)
      : [];
    return {
      pageId: String(value.pageId ?? '').trim(),
      pageName: String(value.pageName ?? '').trim(),
      pageToken: String(value.pageToken ?? '').trim(),
      pages,
      connectedAt: String(value.connectedAt ?? '').trim(),
      lastError: String(value.lastError ?? '').trim(),
      facebookUserId: String(value.facebookUserId ?? '').trim(),
      facebookUserToken: String(value.facebookUserToken ?? '').trim(),
      facebookTokenExpiresAt: String(value.facebookTokenExpiresAt ?? '').trim(),
      instagramUserId: String(value.instagramUserId ?? '').trim(),
      instagramUsername: String(value.instagramUsername ?? '').trim(),
      instagramToken: String(value.instagramToken ?? '').trim(),
      instagramTokenExpiresAt: String(value.instagramTokenExpiresAt ?? '').trim(),
      instagramConnectedAt: String(value.instagramConnectedAt ?? '').trim(),
      instagramLastError: String(value.instagramLastError ?? '').trim(),
    };
  } catch {
    return emptySocialConfig();
  }
}
