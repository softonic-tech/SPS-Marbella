'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type SocialStatus = {
  ok: boolean;
  facebook: boolean;
  instagram: boolean;
  oauth: boolean;
  instagramOauth: boolean;
  pageName: string;
  pages: { id: string; name: string }[];
  selectedPageId: string;
  instagramUsername: string;
  lastError: string;
  instagramLastError: string;
  drafts: ProjectDraft[];
};

type ProjectDraft = {
  id: string;
  title: string;
  description: string;
  imageId: string;
  imageUrl: string;
  createdAt: string;
  lastPostedAt?: string;
};

type Phase = 'idle' | 'connecting' | 'uploading' | 'posting' | 'posted' | 'error';
type BannerTone = 'info' | 'working' | 'success' | 'error';

const emptyStatus = (): SocialStatus => ({
  ok: false,
  facebook: false,
  instagram: false,
  oauth: false,
  instagramOauth: false,
  pageName: '',
  pages: [],
  selectedPageId: '',
  instagramUsername: '',
  lastError: '',
  instagramLastError: '',
  drafts: [],
});

export default function AdminSocialPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [bannerTone, setBannerTone] = useState<BannerTone>('info');
  const [bannerTitle, setBannerTitle] = useState('');
  const [message, setMessage] = useState('');
  const [social, setSocial] = useState<SocialStatus>(emptyStatus());

  const showBanner = (tone: BannerTone, title: string, text: string, nextPhase: Phase = 'idle') => {
    setBannerTone(tone);
    setBannerTitle(title);
    setMessage(text);
    setPhase(nextPhase);
  };
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [draftId, setDraftId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [postFacebook, setPostFacebook] = useState(true);
  const [postInstagram, setPostInstagram] = useState(true);

  const busy = phase === 'connecting' || phase === 'uploading' || phase === 'posting';

  const loadSocial = async () => {
    const response = await fetch('/api/social', { credentials: 'include' });
    if (response.status === 401) {
      setAuthed(false);
      return;
    }
    const data = (await response.json()) as SocialStatus;
    setSocial({ ...emptyStatus(), ...data, drafts: data.drafts || [] });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fb = params.get('fb');
    const ig = params.get('ig');
    const msg = params.get('msg');
    if (fb === 'connected' || ig === 'connected') {
      showBanner('success', 'Connected', msg || (fb ? 'Facebook is connected.' : 'Instagram is connected.'));
    }
    if (fb === 'error' || ig === 'error') {
      showBanner('error', 'Error', msg || 'Connection failed.', 'error');
    }
    if (fb || ig) window.history.replaceState({}, '', '/admin');

    (async () => {
      try {
        const response = await fetch('/api/admin/session', { credentials: 'include' });
        if (response.ok) {
          setAuthed(true);
          await loadSocial();
        }
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const canPost = useMemo(() => {
    const hasImage = Boolean(file || imageUrl);
    const hasText = title.trim().length > 0 || description.trim().length > 0;
    const hasTarget =
      (postFacebook && social.facebook) || (postInstagram && social.instagram);
    return hasImage && hasText && hasTarget && !busy;
  }, [file, imageUrl, title, description, postFacebook, postInstagram, social, busy]);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    showBanner('working', 'Signing in', 'Checking password…', 'connecting');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        showBanner('error', 'Error', data.error || 'Incorrect password.', 'error');
        return;
      }
      setAuthed(true);
      setPassword('');
      await loadSocial();
      showBanner('success', 'Signed in', 'Ready to connect and post.');
    } catch {
      showBanner('error', 'Error', 'Could not reach the admin API.', 'error');
    }
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    setAuthed(false);
    setSocial(emptyStatus());
    setPhase('idle');
    setMessage('');
    setBannerTitle('');
  };

  const connect = async (network: 'facebook' | 'instagram') => {
    showBanner(
      'working',
      'Connecting',
      network === 'facebook' ? 'Opening Facebook…' : 'Opening Instagram…',
      'connecting',
    );
    try {
      const response = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: network === 'facebook' ? 'facebook-connect' : 'instagram-connect',
        }),
      });
      const data = (await response.json()) as { ok?: boolean; url?: string; error?: string };
      if (response.status === 401) {
        setAuthed(false);
        showBanner('error', 'Error', 'Session expired. Sign in again.', 'error');
        return;
      }
      if (!response.ok || !data.ok || !data.url) {
        showBanner('error', 'Error', data.error || 'Could not start connect.', 'error');
        return;
      }
      window.location.href = data.url;
    } catch {
      showBanner('error', 'Error', 'Could not start connect.', 'error');
    }
  };

  const disconnect = async (network: 'facebook' | 'instagram') => {
    const label = network === 'facebook' ? 'Facebook' : 'Instagram';
    if (!window.confirm(`Disconnect ${label}?`)) return;
    showBanner('working', 'Working', `Disconnecting ${label}…`, 'connecting');
    const response = await fetch('/api/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        action: network === 'facebook' ? 'facebook-disconnect' : 'instagram-disconnect',
      }),
    });
    const data = (await response.json()) as SocialStatus & { ok?: boolean; error?: string };
    if (!response.ok) {
      showBanner('error', 'Error', data.error || `Could not disconnect ${label}.`, 'error');
      return;
    }
    setSocial((prev) => ({ ...prev, ...data, drafts: prev.drafts }));
    showBanner('info', 'Disconnected', `${label} disconnected.`);
  };

  const selectPage = async (pageId: string) => {
    const response = await fetch('/api/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'facebook-select-page', pageId }),
    });
    const data = (await response.json()) as SocialStatus & { pageName?: string };
    if (response.ok) {
      setSocial((prev) => ({ ...prev, ...data, drafts: prev.drafts }));
      setMessage(`Using ${data.pageName || 'page'}.`);
    }
  };

  const uploadIfNeeded = async () => {
    if (!file) return { imageUrl, draftId };
    showBanner('working', 'Uploading', 'Uploading image…', 'uploading');
    const form = new FormData();
    form.set('action', 'upload');
    form.set('file', file);
    form.set('title', title);
    form.set('description', description);
    const response = await fetch('/api/social', {
      method: 'POST',
      credentials: 'include',
      body: form,
    });
    const data = (await response.json()) as {
      ok?: boolean;
      error?: string;
      draft?: ProjectDraft;
      drafts?: ProjectDraft[];
      asset?: { url?: string };
    };
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Upload failed.');
    }
    const nextUrl = data.draft?.imageUrl || data.asset?.url || '';
    const nextDraftId = data.draft?.id || draftId;
    if (data.drafts) setSocial((prev) => ({ ...prev, drafts: data.drafts || [] }));
    if (data.draft) {
      setTitle(data.draft.title);
      setDescription(data.draft.description);
    }
    setImageUrl(nextUrl);
    setDraftId(nextDraftId);
    setFile(null);
    return { imageUrl: nextUrl, draftId: nextDraftId };
  };

  const publish = async () => {
    if (!postFacebook && !postInstagram) {
      showBanner('error', 'Error', 'Choose Facebook and/or Instagram.', 'error');
      return;
    }
    if (postFacebook && !social.facebook) {
      showBanner('error', 'Error', 'Connect Facebook first.', 'error');
      return;
    }
    if (postInstagram && !social.instagram) {
      showBanner('error', 'Error', 'Connect Instagram first.', 'error');
      return;
    }
    if (!file && !imageUrl) {
      showBanner('error', 'Error', 'Choose a project image.', 'error');
      return;
    }
    if (!title.trim() && !description.trim()) {
      showBanner('error', 'Error', 'Add a title or description.', 'error');
      return;
    }

    try {
      const uploaded = await uploadIfNeeded();
      const targets = [
        postFacebook ? 'Facebook' : null,
        postInstagram ? 'Instagram' : null,
      ].filter(Boolean);
      showBanner('working', 'Posting', `Posting to ${targets.join(' & ')}…`, 'posting');

      const response = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'publish',
          title,
          description,
          imageUrl: uploaded.imageUrl,
          draftId: uploaded.draftId,
          facebook: postFacebook,
          instagram: postInstagram,
        }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        facebook?: { ok?: boolean; id?: string; error?: string };
        instagram?: { ok?: boolean; id?: string; username?: string; error?: string };
        drafts?: ProjectDraft[];
      };

      if (response.status === 401) {
        setAuthed(false);
        showBanner('error', 'Error', 'Session expired. Sign in again.', 'error');
        return;
      }

      const parts: string[] = [];
      if (postFacebook) {
        parts.push(
          result.facebook?.ok
            ? 'Facebook posted'
            : `Facebook failed: ${result.facebook?.error || 'error'}`,
        );
      }
      if (postInstagram) {
        parts.push(
          result.instagram?.ok
            ? `Instagram posted${result.instagram.username ? ` (@${result.instagram.username})` : ''}`
            : `Instagram failed: ${result.instagram?.error || 'error'}`,
        );
      }

      if (Array.isArray(result.drafts)) {
        setSocial((prev) => ({ ...prev, drafts: result.drafts || [] }));
      }

      if (result.ok) {
        showBanner('success', 'Posted', parts.join(' · '), 'posted');
      } else {
        showBanner('error', 'Error', parts.join(' · ') || result.error || 'Posting failed.', 'error');
      }
      await loadSocial();
    } catch (caught) {
      showBanner('error', 'Error', caught instanceof Error ? caught.message : 'Posting failed.', 'error');
    }
  };

  const pickDraft = (draft: ProjectDraft) => {
    setDraftId(draft.id);
    setTitle(draft.title);
    setDescription(draft.description);
    setImageUrl(draft.imageUrl);
    setFile(null);
    showBanner('info', 'Loaded', `Loaded “${draft.title}”.`);
  };

  const displayImage = previewUrl || imageUrl;

  if (checking) {
    return (
      <div className="admin-shell">
        <div className="shell">
          <p className="admin-step">Admin</p>
          <p className="admin-hint">Loading…</p>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="admin-shell">
        <div className="shell">
          <form className="admin-login" onSubmit={login}>
            <p className="admin-step">SPS Marbella</p>
            <h1>Admin</h1>
            <p>Sign in to connect accounts and post projects.</p>
            <div className="admin-card">
              <label className="admin-field">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>
              <div className="admin-actions">
                <button className="admin-btn wide" type="submit" disabled={busy}>
                  {phase === 'connecting' ? 'Signing in…' : 'Sign in'}
                </button>
              </div>
              {message ? (
                <div className={`admin-banner ${bannerTone}`}>
                  <div>
                    <strong>{bannerTitle || 'Status'}</strong>
                    {message}
                  </div>
                </div>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <div className="shell">
        <div className="admin-topbar admin-head">
          <div>
            <p className="admin-step">SPS Admin</p>
            <h1>Social posts</h1>
            <p>Connect once, then upload a project and post.</p>
          </div>
          <button type="button" className="admin-btn ghost" onClick={logout} disabled={busy}>
            Sign out
          </button>
        </div>

        {message ? (
          <div className={`admin-banner ${bannerTone}`}>
            <div>
              <strong>{bannerTitle || 'Status'}</strong>
              {message}
            </div>
          </div>
        ) : null}

        <section className="admin-card">
          <p className="admin-step">Step 1</p>
          <h2>Connect</h2>
          <div className="admin-connect-list">
            <div className="admin-connect-row">
              <div>
                <span className="label">
                  <span className={`admin-status-dot ${social.facebook ? 'on' : ''}`} />
                  Facebook
                </span>
                <span className="sub">
                  {social.facebook
                    ? `Connected · ${social.pageName || 'Page'}`
                    : social.oauth
                      ? 'Not connected'
                      : 'App keys missing in env'}
                </span>
              </div>
              {social.facebook ? (
                <button
                  type="button"
                  className="admin-btn ghost"
                  disabled={busy}
                  onClick={() => void disconnect('facebook')}
                >
                  Disconnect
                </button>
              ) : (
                <button
                  type="button"
                  className="admin-btn"
                  disabled={busy || !social.oauth}
                  onClick={() => void connect('facebook')}
                >
                  {phase === 'connecting' ? 'Connecting…' : 'Connect'}
                </button>
              )}
            </div>

            <div className="admin-connect-row">
              <div>
                <span className="label">
                  <span className={`admin-status-dot ${social.instagram ? 'on' : ''}`} />
                  Instagram
                </span>
                <span className="sub">
                  {social.instagram
                    ? `Connected · @${social.instagramUsername || 'account'}`
                    : social.instagramOauth
                      ? 'Not connected'
                      : 'App keys missing in env'}
                </span>
              </div>
              {social.instagram ? (
                <button
                  type="button"
                  className="admin-btn ghost"
                  disabled={busy}
                  onClick={() => void disconnect('instagram')}
                >
                  Disconnect
                </button>
              ) : (
                <button
                  type="button"
                  className="admin-btn"
                  disabled={busy || !social.instagramOauth}
                  onClick={() => void connect('instagram')}
                >
                  {phase === 'connecting' ? 'Connecting…' : 'Connect'}
                </button>
              )}
            </div>
          </div>

          {social.pages.length > 1 ? (
            <label className="admin-field">
              Facebook Page
              <select
                value={social.selectedPageId}
                onChange={(event) => void selectPage(event.target.value)}
                disabled={busy}
              >
                {social.pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </section>

        <section className="admin-card">
          <p className="admin-step">Step 2</p>
          <h2>Create post</h2>

          <label className="admin-field">
            Title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Villa renovation, Nueva Andalucía"
              disabled={busy}
            />
          </label>
          <label className="admin-field">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Write the caption for Facebook and Instagram…"
              disabled={busy}
            />
          </label>
          <label className="admin-field">
            Project image
            <input
              type="file"
              accept="image/*"
              disabled={busy}
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
            {file ? <span className="admin-file-name">{file.name}</span> : null}
          </label>

          <div className="admin-targets">
            <label className={`admin-target ${postFacebook ? '' : 'off'}`}>
              <input
                type="checkbox"
                checked={postFacebook}
                disabled={busy || !social.facebook}
                onChange={(event) => setPostFacebook(event.target.checked)}
              />
              Facebook
            </label>
            <label className={`admin-target ${postInstagram ? '' : 'off'}`}>
              <input
                type="checkbox"
                checked={postInstagram}
                disabled={busy || !social.instagram}
                onChange={(event) => setPostInstagram(event.target.checked)}
              />
              Instagram
            </label>
          </div>

          <div className="admin-preview">
            {displayImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayImage} alt="" />
            ) : (
              <div className="placeholder">Image preview</div>
            )}
            <div className="body">
              <strong>{title.trim() || 'Project title'}</strong>
              <p>{description.trim() || 'Caption preview…'}</p>
            </div>
          </div>

          <div className="admin-actions">
            <button
              type="button"
              className="admin-btn wide"
              disabled={!canPost}
              onClick={() => void publish()}
            >
              {phase === 'uploading'
                ? 'Uploading…'
                : phase === 'posting'
                  ? 'Posting…'
                  : 'Post now'}
            </button>
          </div>
          {!social.facebook && !social.instagram ? (
            <p className="admin-hint">Connect Facebook or Instagram above before posting.</p>
          ) : null}
        </section>

        {social.drafts.length > 0 ? (
          <section className="admin-card">
            <p className="admin-step">Recent</p>
            <h2>Projects</h2>
            <ul className="admin-drafts">
              {social.drafts.map((draft) => (
                <li key={draft.id}>
                  <button
                    type="button"
                    className="admin-draft-btn"
                    onClick={() => pickDraft(draft)}
                    disabled={busy}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={draft.imageUrl} alt="" />
                    <span>
                      <strong>{draft.title}</strong>
                      <em>
                        {draft.lastPostedAt
                          ? `Posted ${new Date(draft.lastPostedAt).toLocaleString()}`
                          : 'Ready to post'}
                      </em>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
