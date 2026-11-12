'use client';

import { useEffect, useState } from 'react';

type OverviewData = {
  storage: string;
  connections: {
    facebook: boolean;
    facebookPage: string;
    instagram: boolean;
    instagramUsername: string;
  };
  requests: {
    total: number;
    last7Days: number;
    byStatus: { new: number; reviewing: number; done: number; archived: number };
    latest: { id: string; name: string; projectType: string; createdAt: string; status: string }[];
  };
  site: {
    projects: number;
    photos: number;
    drafts: number;
    byCategory: Record<string, number>;
  };
};

type Props = {
  onBanner: (tone: 'info' | 'working' | 'success' | 'error', title: string, text: string) => void;
  onSessionExpired: () => void;
  onOpenRequests: () => void;
};

export default function AdminOverview({ onBanner, onSessionExpired, onOpenRequests }: Props) {
  const [data, setData] = useState<OverviewData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/admin/overview', { credentials: 'include' });
        if (response.status === 401) {
          onSessionExpired();
          return;
        }
        const json = (await response.json()) as OverviewData & { ok?: boolean };
        if (!response.ok || !json.ok) {
          onBanner('error', 'Error', 'Could not load overview.');
          return;
        }
        setData(json);
      } catch {
        onBanner('error', 'Error', 'Could not load overview.');
      }
    })();
  }, [onBanner, onSessionExpired]);

  if (!data) {
    return (
      <section className="admin-card">
        <p className="admin-step">Overview</p>
        <p className="admin-hint">Loading dashboard…</p>
      </section>
    );
  }

  return (
    <>
      <section className="admin-card">
        <p className="admin-step">Overview</p>
        <h2>Admin dashboard</h2>
        <p className="admin-hint">Contact requests, social connections, and site content at a glance.</p>

        <div className="admin-stat-grid">
          <div className="admin-stat">
            <span>New requests</span>
            <strong>{data.requests.byStatus.new}</strong>
          </div>
          <div className="admin-stat">
            <span>Last 7 days</span>
            <strong>{data.requests.last7Days}</strong>
          </div>
          <div className="admin-stat">
            <span>Projects</span>
            <strong>{data.site.projects}</strong>
          </div>
          <div className="admin-stat">
            <span>Project photos</span>
            <strong>{data.site.photos}</strong>
          </div>
        </div>

        <div className="admin-connect-list" style={{ marginTop: 18 }}>
          <div className="admin-connect-row">
            <div>
              <span className="label">
                <span className={`admin-status-dot ${data.connections.facebook ? 'on' : ''}`} />
                Facebook
              </span>
              <span className="sub">
                {data.connections.facebook
                  ? `Connected · ${data.connections.facebookPage || 'Page'}`
                  : 'Not connected'}
              </span>
            </div>
          </div>
          <div className="admin-connect-row">
            <div>
              <span className="label">
                <span className={`admin-status-dot ${data.connections.instagram ? 'on' : ''}`} />
                Instagram
              </span>
              <span className="sub">
                {data.connections.instagram
                  ? `Connected · @${data.connections.instagramUsername || 'account'}`
                  : 'Not connected'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-card">
        <p className="admin-step">Inbox</p>
        <h2>Latest contact requests</h2>
        {data.requests.latest.length === 0 ? (
          <p className="admin-empty">No enquiries yet. New contact form submissions will appear here.</p>
        ) : (
          <div className="admin-request-list stacked">
            {data.requests.latest.map((item) => (
              <div key={item.id} className="admin-request-item static">
                <strong>{item.name}</strong>
                <span>{item.projectType || 'General enquiry'}</span>
                <em>
                  {item.status} · {new Date(item.createdAt).toLocaleString()}
                </em>
              </div>
            ))}
          </div>
        )}
        <div className="admin-actions">
          <button type="button" className="admin-btn" onClick={onOpenRequests}>
            Review requests
          </button>
        </div>
      </section>
    </>
  );
}
