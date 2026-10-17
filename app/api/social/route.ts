import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/social/auth';
import { facebookAppReady, instagramAppReady, publicOrigin } from '@/lib/social/env';
import {
  buildFacebookAuthUrl,
  buildInstagramAuthUrl,
  clearInstagramLogin,
  createOAuthState,
  facebookRedirectUri,
  instagramRedirectUri,
  publishFacebook,
  publishInstagram,
  refreshInstagramTokenIfNeeded,
  selectFacebookPage,
  socialStatus,
} from '@/lib/social/meta';
import { listDrafts, readSocial, saveDraft, saveUpload, storageMode, updateDraft, writeSocial } from '@/lib/social/store';

async function requireAdmin() {
  return isAdminAuthenticated();
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const config = await readSocial();
  const drafts = await listDrafts();
  return NextResponse.json({
    ...socialStatus(config),
    drafts,
    storage: storageMode(),
  });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const contentType = request.headers.get('content-type') || '';
  const origin = publicOrigin(new URL(request.url).origin);

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const action = String(form.get('action') || '');
    if (action !== 'upload') {
      return NextResponse.json({ ok: false, error: 'Unknown upload action.' }, { status: 400 });
    }
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: 'Choose an image file to upload.' }, { status: 400 });
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ ok: false, error: 'Only image uploads are supported.' }, { status: 400 });
    }
    if (file.size > 12 * 1024 * 1024) {
      return NextResponse.json({ ok: false, error: 'Image must be under 12 MB.' }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await saveUpload({
      filename: file.name || 'project.jpg',
      contentType: file.type || 'image/jpeg',
      buffer,
    });
    const title = String(form.get('title') || '').trim().slice(0, 160);
    const description = String(form.get('description') || '').trim().slice(0, 2200);
    const draft = {
      id: randomUUID().replace(/-/g, '').slice(0, 16),
      title: title || 'SPS project',
      description,
      imageId: asset.id,
      imageUrl: asset.url || `${origin}/api/uploads/${asset.id}`,
      createdAt: new Date().toISOString(),
    };
    await saveDraft(draft);
    return NextResponse.json({ ok: true, asset, draft, drafts: await listDrafts() });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = String(body.action || '').trim();

  if (action === 'facebook-connect') {
    if (!facebookAppReady()) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Set META_APP_ID and META_APP_SECRET (or FACEBOOK_APP_ID / FACEBOOK_APP_SECRET) first.',
          redirectUri: facebookRedirectUri(origin),
        },
        { status: 400 },
      );
    }
    const state = createOAuthState();
    return NextResponse.json({
      ok: true,
      url: buildFacebookAuthUrl(origin, state),
      redirectUri: facebookRedirectUri(origin),
    });
  }

  if (action === 'facebook-select-page') {
    const next = selectFacebookPage(await readSocial(), String(body.pageId || '').trim());
    if (!next) return NextResponse.json({ ok: false, error: 'That Facebook Page was not found.' }, { status: 400 });
    await writeSocial(next);
    return NextResponse.json(socialStatus(next));
  }

  if (action === 'facebook-disconnect') {
    const current = await readSocial();
    const next = {
      ...current,
      pageId: '',
      pageName: '',
      pageToken: '',
      pages: [],
      connectedAt: '',
      lastError: '',
      facebookUserId: '',
      facebookUserToken: '',
      facebookTokenExpiresAt: '',
    };
    await writeSocial(next);
    return NextResponse.json(socialStatus(next));
  }

  if (action === 'instagram-connect') {
    if (!instagramAppReady()) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Set INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET first.',
          redirectUri: instagramRedirectUri(origin),
        },
        { status: 400 },
      );
    }
    const state = createOAuthState();
    const redirectUri = instagramRedirectUri(origin);
    const url = buildInstagramAuthUrl(origin, state);
    console.log('[instagram-connect] redirect_uri =>', redirectUri);
    return NextResponse.json({ ok: true, url, redirectUri });
  }

  if (action === 'instagram-disconnect') {
    const next = clearInstagramLogin(await readSocial());
    await writeSocial(next);
    return NextResponse.json(socialStatus(next));
  }

  if (action === 'publish') {
    const title = String(body.title || '').trim().slice(0, 160);
    const description = String(body.description || '').trim().slice(0, 2200);
    const imageUrl = String(body.imageUrl || '').trim();
    const draftId = String(body.draftId || '').trim();
    const targets = {
      facebook: body.facebook !== false,
      instagram: body.instagram !== false,
    };
    const message = [title, description].filter(Boolean).join('\n\n').trim();
    if (message.length < 8) {
      return NextResponse.json({ ok: false, error: 'Add a project title or description before posting.' }, { status: 400 });
    }
    if (!/^https:\/\//i.test(imageUrl)) {
      return NextResponse.json(
        { ok: false, error: 'Upload a project image first (public https URL required for Meta).' },
        { status: 400 },
      );
    }

    let config = await readSocial();
    config = await refreshInstagramTokenIfNeeded(config);
    await writeSocial(config);

    const results: Record<string, unknown> = { ok: true };

    if (targets.facebook) {
      const fb = await publishFacebook({ message, image: imageUrl, withPhoto: true }, config);
      results.facebook = fb;
      if (!fb.ok) results.ok = false;
    }
    if (targets.instagram) {
      const ig = await publishInstagram({ message, image: imageUrl }, config);
      results.instagram = ig;
      if (!ig.ok) results.ok = false;
    }

    if (draftId) {
      const fb = results.facebook as { ok?: boolean; id?: string } | undefined;
      const ig = results.instagram as { ok?: boolean; id?: string } | undefined;
      await updateDraft(draftId, {
        lastPostedAt: new Date().toISOString(),
        lastFacebookId: fb?.ok ? fb.id || '' : undefined,
        lastInstagramId: ig?.ok ? ig.id || '' : undefined,
      });
    }

    return NextResponse.json(
      {
        ...results,
        status: socialStatus(await readSocial()),
        drafts: await listDrafts(),
      },
      { status: results.ok ? 200 : 400 },
    );
  }

  return NextResponse.json({ ok: false, error: 'Unknown social action.' }, { status: 400 });
}
