'use client';

import { FormEvent, useEffect, useState } from 'react';
import AdminProjectPublisher from './AdminProjectPublisher';

type SocialStatus = {
  ok: boolean;
  facebook: boolean;
  instagram: boolean;
  oauth: boolean;
  instagramOauth: boolean;
  instagramViaFacebook: boolean;
  canLinkInstagramFromFacebook: boolean;
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
  instagramViaFacebook: false,
  canLinkInstagramFromFacebook: false,
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
      network === 'facebook' ? 'Opening Facebook…' : 'Linking Instagram…',
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
      const data = (await response.json()) as SocialStatus & {
        ok?: boolean;
        url?: string;
        linked?: boolean;
        error?: string;
      };
      if (response.status === 401) {
        setAuthed(false);
        showBanner('error', 'Error', 'Session expired. Sign in again.', 'error');
        return;
      }
      if (!response.ok || !data.ok) {
        showBanner('error', 'Error', data.error || 'Could not start connect.', 'error');
        return;
      }
      // Instagram linked from the Facebook Page — no browser redirect.
      if (network === 'instagram' && data.linked) {
        setSocial((prev) => ({ ...prev, ...data, drafts: prev.drafts }));
        showBanner(
          'success',
          'Connected',
          data.instagramUsername
            ? `Instagram connected · @${data.instagramUsername}`
            : 'Instagram connected from your Facebook Page.',
        );
        return;
      }
      if (!data.url) {
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
            <p>Connect once, then publish photos from the current projects.</p>
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
                    ? social.instagramViaFacebook
                      ? `Connected · @${social.instagramUsername || 'account'} via Facebook Page`
                      : `Connected · @${social.instagramUsername || 'account'}`
                    : social.canLinkInstagramFromFacebook
                      ? 'Not connected · link the Business account from your Facebook Page'
                      : social.instagramOauth
                        ? 'Connect Facebook first, then link Instagram'
                        : 'Connect Facebook first'}
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
                  disabled={busy || (!social.canLinkInstagramFromFacebook && !social.instagramOauth)}
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

          {social.instagramLastError && !social.instagram ? (
            <p className="admin-hint">{social.instagramLastError}</p>
          ) : null}
          <p className="admin-hint">
            Instagram uses the same Meta app as Facebook. Link an Instagram Business or Creator account to the Page in
            Meta Business Suite, then reconnect Facebook (to grant Instagram permissions) and Connect Instagram.
          </p>
        </section>

        <AdminProjectPublisher
          facebookConnected={social.facebook}
          instagramConnected={social.instagram}
          busy={busy}
          onBanner={(tone, title, text, nextPhase) => {
            if (text.startsWith('Session expired')) setAuthed(false);
            showBanner(tone, title, text, nextPhase);
          }}
        />
      </div>
    </div>
  );
}
