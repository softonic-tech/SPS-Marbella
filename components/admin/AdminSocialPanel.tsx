'use client';

import { useEffect, useState } from 'react';
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
  drafts: { id: string }[];
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

type Props = {
  busy: boolean;
  phase: Phase;
  onBanner: (tone: BannerTone, title: string, text: string, nextPhase?: Phase) => void;
  onSessionExpired: () => void;
};

export default function AdminSocialPanel({ busy, phase, onBanner, onSessionExpired }: Props) {
  const [social, setSocial] = useState<SocialStatus>(emptyStatus());

  const loadSocial = async () => {
    const response = await fetch('/api/social', { credentials: 'include' });
    if (response.status === 401) {
      onSessionExpired();
      return;
    }
    const data = (await response.json()) as SocialStatus;
    setSocial({ ...emptyStatus(), ...data, drafts: data.drafts || [] });
  };

  useEffect(() => {
    void loadSocial();
  }, []);

  const connect = async (network: 'facebook' | 'instagram') => {
    onBanner(
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
        reauth?: boolean;
        debug?: {
          pageId?: string;
          pageName?: string;
          missingScopes?: string[];
          hasBusinessAccount?: boolean;
          hasConnectedAccount?: boolean;
          notes?: string[];
        };
      };
      if (response.status === 401) {
        onSessionExpired();
        onBanner('error', 'Error', 'Session expired. Sign in again.', 'error');
        return;
      }
      if (!response.ok || !data.ok) {
        const debugBits = data.debug
          ? [
              data.debug.pageName || data.debug.pageId
                ? `Page: ${data.debug.pageName || ''} ${data.debug.pageId || ''}`.trim()
                : '',
              data.debug.missingScopes?.length
                ? `Missing scopes: ${data.debug.missingScopes.join(', ')}`
                : '',
              ...(data.debug.notes || []),
            ]
              .filter(Boolean)
              .join(' | ')
          : '';
        onBanner(
          'error',
          'Error',
          [data.error || 'Could not start connect.', debugBits].filter(Boolean).join('\n'),
          'error',
        );
        return;
      }
      if (network === 'instagram' && data.linked) {
        setSocial((prev) => ({ ...prev, ...data, drafts: prev.drafts }));
        onBanner(
          'success',
          'Connected',
          data.instagramUsername
            ? `Instagram connected · @${data.instagramUsername}`
            : 'Instagram connected from your Facebook Page.',
        );
        return;
      }
      if (!data.url) {
        onBanner('error', 'Error', data.error || 'Could not start connect.', 'error');
        return;
      }
      if (network === 'instagram' && data.reauth) {
        onBanner(
          'working',
          'Reconnect Facebook',
          'Opening Facebook again so Instagram publish permissions can be granted…',
          'connecting',
        );
      }
      window.location.href = data.url;
    } catch {
      onBanner('error', 'Error', 'Could not start connect.', 'error');
    }
  };

  const disconnect = async (network: 'facebook' | 'instagram') => {
    const label = network === 'facebook' ? 'Facebook' : 'Instagram';
    if (!window.confirm(`Disconnect ${label}?`)) return;
    onBanner('working', 'Working', `Disconnecting ${label}…`, 'connecting');
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
      onBanner('error', 'Error', data.error || `Could not disconnect ${label}.`, 'error');
      return;
    }
    setSocial((prev) => ({ ...prev, ...data, drafts: prev.drafts }));
    onBanner('info', 'Disconnected', `${label} disconnected.`);
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
      onBanner('info', 'Page', `Using ${data.pageName || 'page'}.`);
    }
  };

  return (
    <>
      <section className="admin-card">
        <p className="admin-step">Social</p>
        <h2>Connect accounts</h2>
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
                    ? 'Not connected · link from your Facebook Page'
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
      </section>

      <AdminProjectPublisher
        facebookConnected={social.facebook}
        instagramConnected={social.instagram}
        busy={busy}
        onBanner={(tone, title, text, nextPhase) => {
          if (text.startsWith('Session expired')) onSessionExpired();
          onBanner(tone, title, text, nextPhase);
        }}
      />
    </>
  );
}
