import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/social/auth';
import { env, facebookAppReady, instagramAppReady, publicOrigin } from '@/lib/social/env';
import {
  buildFacebookAuthUrl,
  buildInstagramAuthUrl,
  clearInstagramLogin,
  createOAuthState,
  facebookRedirectUri,
  instagramRedirectUri,
  linkInstagramFromFacebookPage,
  publishFacebook,
  publishInstagram,
  refreshInstagramTokenIfNeeded,
  selectFacebookPage,
  socialStatus,
} from '@/lib/social/meta';
import { absoluteAssetUrl, MAX_PROJECT_PHOTOS, projectById, STAGE_LABEL } from '@/lib/social/project-posts';
import { listDrafts, readSocial, saveDraft, saveUpload, storageMode, updateDraft, writeSocial } from '@/lib/social/store';
import type { SocialConfig } from '@/lib/social/types';

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
    let next = selectFacebookPage(await readSocial(), String(body.pageId || '').trim());
    if (!next) return NextResponse.json({ ok: false, error: 'That Facebook Page was not found.' }, { status: 400 });
    try {
      next = await linkInstagramFromFacebookPage(next);
    } catch (caught) {
      next = {
        ...clearInstagramLogin(next),
        instagramLastError: caught instanceof Error ? caught.message : 'Instagram was not linked from this Page.',
      };
    }
    await writeSocial(next);
    return NextResponse.json(socialStatus(next));
  }

  if (action === 'facebook-disconnect') {
    const current = await readSocial();
    let next: SocialConfig = {
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
    // Page-linked Instagram uses the Page token, so clear it with Facebook.
    if (!current.instagramToken || current.instagramSource === 'facebook-page') {
      next = clearInstagramLogin(next);
    }
    await writeSocial(next);
    return NextResponse.json(socialStatus(next));
  }

  if (action === 'instagram-connect') {
    const current = await readSocial();
    // Preferred path: same Meta app as Facebook — link the Page's Instagram Business account.
    if (current.pageId && current.pageToken) {
      try {
        const next = await linkInstagramFromFacebookPage(current);
        await writeSocial(next);
        console.log('[instagram-connect] linked from Facebook Page', {
          pageId: next.pageId,
          pageName: next.pageName,
          instagramUserId: next.instagramUserId,
          instagramUsername: next.instagramUsername,
        });
        return NextResponse.json({
          ...socialStatus(next),
          linked: true,
        });
      } catch (caught) {
        const message =
          caught instanceof Error
            ? caught.message
            : 'Could not link Instagram from the Facebook Page.';
        const debug =
          caught && typeof caught === 'object' && 'debug' in caught
            ? (caught as {
                debug?: { missingScopes?: string[] };
              }).debug
            : undefined;
        console.error('[instagram-connect] page link failed', { message, debug });
        await writeSocial({ ...current, instagramLastError: message });

        const missing = debug?.missingScopes || [];
        const needsInstagramScopes =
          missing.includes('instagram_basic') || missing.includes('instagram_content_publish');
        // Re-run Facebook Login with Page + Instagram scopes (no META_LOGIN_CONFIG_ID).
        if (needsInstagramScopes && !env('META_LOGIN_CONFIG_ID')) {
          const state = createOAuthState();
          return NextResponse.json({
            ok: true,
            url: buildFacebookAuthUrl(origin, state, { withInstagram: true }),
            reauth: true,
            error: message,
            debug,
          });
        }

        return NextResponse.json({ ok: false, error: message, debug }, { status: 400 });
      }
    }

    if (!instagramAppReady()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Connect Facebook first, then Connect Instagram to use the Page’s linked Instagram Business account. Or set INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET for Instagram Login.',
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

  if (action === 'publish-project') {
    const project = projectById(String(body.projectId || '').trim());
    if (!project) {
      return NextResponse.json({ ok: false, error: 'Choose one of the site projects.' }, { status: 400 });
    }
    const requested = Array.isArray(body.images) ? body.images.map((item) => String(item)) : [];
    const images = project.media.filter((item) => item.kind === 'image' && requested.includes(item.src));
    if (images.length === 0) {
      return NextResponse.json({ ok: false, error: 'Select at least one project photo.' }, { status: 400 });
    }
    if (images.length > MAX_PROJECT_PHOTOS) {
      return NextResponse.json(
        { ok: false, error: `Select up to ${MAX_PROJECT_PHOTOS} photos at a time.` },
        { status: 400 },
      );
    }
    const caption = String(body.caption || '').trim().slice(0, 2000);
    if (caption.length < 8) {
      return NextResponse.json({ ok: false, error: 'Write a longer caption.' }, { status: 400 });
    }
    const targets = {
      facebook: body.facebook !== false,
      instagram: body.instagram === true,
    };
    if (!targets.facebook && !targets.instagram) {
      return NextResponse.json({ ok: false, error: 'Choose Facebook or Instagram.' }, { status: 400 });
    }

    let config = await readSocial();
    config = await refreshInstagramTokenIfNeeded(config);
    await writeSocial(config);

    const stages = [...new Set(images.map((image) => STAGE_LABEL[image.stage]))];
    const message = `${caption}\n\n${stages.join(' · ')}`.slice(0, 2200);
    const imageUrls = images.map((image) => absoluteAssetUrl(origin, image.src));

    let firstError = '';
    let facebookOk = !targets.facebook;
    let instagramOk = !targets.instagram;

    if (targets.facebook) {
      const fb = await publishFacebook({ message, images: imageUrls, withPhoto: true }, config);
      facebookOk = fb.ok;
      if (!fb.ok && !firstError) firstError = fb.error;
    }
    if (targets.instagram) {
      const ig = await publishInstagram({ message, images: imageUrls }, config);
      instagramOk = ig.ok;
      if (!ig.ok && !firstError) firstError = ig.error;
    }

    const ok = facebookOk && instagramOk;
    return NextResponse.json(
      {
        ok,
        posted: ok ? 1 : 0,
        failed: ok ? 0 : 1,
        photoCount: images.length,
        mode: images.length > 1 ? 'carousel' : 'photo',
        error: ok
          ? undefined
          : firstError || 'Could not publish the post.',
      },
      { status: ok ? 200 : 400 },
    );
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
