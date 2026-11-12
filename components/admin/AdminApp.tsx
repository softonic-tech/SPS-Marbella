'use client';

import { FormEvent, useEffect, useState } from 'react';
import AdminAnalytics from './AdminAnalytics';
import AdminOverview from './AdminOverview';
import AdminRequests from './AdminRequests';
import AdminSocialPanel from './AdminSocialPanel';

type Tab = 'overview' | 'requests' | 'social' | 'analytics';
type Phase = 'idle' | 'connecting' | 'uploading' | 'posting' | 'posted' | 'error';
type BannerTone = 'info' | 'working' | 'success' | 'error';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'requests', label: 'Requests' },
  { id: 'social', label: 'Social' },
  { id: 'analytics', label: 'Analytics' },
];

export default function AdminApp() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<Tab>('overview');
  const [phase, setPhase] = useState<Phase>('idle');
  const [bannerTone, setBannerTone] = useState<BannerTone>('info');
  const [bannerTitle, setBannerTitle] = useState('');
  const [message, setMessage] = useState('');

  const showBanner = (tone: BannerTone, title: string, text: string, nextPhase: Phase = 'idle') => {
    setBannerTone(tone);
    setBannerTitle(title);
    setMessage(text);
    setPhase(nextPhase);
  };
  const busy = phase === 'connecting' || phase === 'uploading' || phase === 'posting';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fb = params.get('fb');
    const ig = params.get('ig');
    const msg = params.get('msg');
    if (fb === 'connected' || ig === 'connected') {
      setTab('social');
      showBanner('success', 'Connected', msg || (fb ? 'Facebook is connected.' : 'Instagram is connected.'));
    }
    if (fb === 'error' || ig === 'error') {
      setTab('social');
      showBanner('error', 'Error', msg || 'Connection failed.', 'error');
    }
    if (fb || ig) window.history.replaceState({}, '', '/admin');

    (async () => {
      try {
        const response = await fetch('/api/admin/session', { credentials: 'include' });
        if (response.ok) setAuthed(true);
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
      showBanner('success', 'Signed in', 'Admin dashboard ready.');
    } catch {
      showBanner('error', 'Error', 'Could not reach the admin API.', 'error');
    }
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    setAuthed(false);
    setTab('overview');
    setPhase('idle');
    setMessage('');
    setBannerTitle('');
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
            <p>Sign in to review requests, publish projects, and check site analytics.</p>
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
            <h1>Dashboard</h1>
            <p>Requests, social publishing, and website analytics.</p>
          </div>
          <button type="button" className="admin-btn ghost" onClick={logout} disabled={busy}>
            Sign out
          </button>
        </div>

        <nav className="admin-tabs" aria-label="Admin sections">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-tab ${tab === item.id ? 'on' : ''}`}
              onClick={() => setTab(item.id)}
              disabled={busy}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {message ? (
          <div className={`admin-banner ${bannerTone}`}>
            <div>
              <strong>{bannerTitle || 'Status'}</strong>
              {message}
            </div>
          </div>
        ) : null}

        {tab === 'overview' ? (
          <AdminOverview
            onBanner={(tone, title, text) => showBanner(tone, title, text)}
            onSessionExpired={() => setAuthed(false)}
            onOpenRequests={() => setTab('requests')}
          />
        ) : null}

        {tab === 'requests' ? (
          <AdminRequests
            busy={busy}
            onBusy={(next) => setPhase(next ? 'connecting' : 'idle')}
            onBanner={(tone, title, text) => showBanner(tone, title, text)}
            onSessionExpired={() => setAuthed(false)}
          />
        ) : null}

        {tab === 'social' ? (
          <AdminSocialPanel
            busy={busy}
            phase={phase}
            onBanner={showBanner}
            onSessionExpired={() => setAuthed(false)}
          />
        ) : null}

        {tab === 'analytics' ? (
          <AdminAnalytics
            onBanner={(tone, title, text) => showBanner(tone, title, text)}
            onSessionExpired={() => setAuthed(false)}
          />
        ) : null}
      </div>
    </div>
  );
}
