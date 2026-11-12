'use client';

import { useEffect, useState } from 'react';

type AnalyticsData = {
  storage: string;
  requests: {
    total: number;
    last7Days: number;
    byStatus: { new: number; reviewing: number; done: number; archived: number };
  };
  site: {
    projects: number;
    photos: number;
    drafts: number;
    byCategory: Record<string, number>;
    pages: { path: string; label: string }[];
  };
  connections: {
    facebook: boolean;
    instagram: boolean;
  };
};

type Props = {
  onBanner: (tone: 'info' | 'working' | 'success' | 'error', title: string, text: string) => void;
  onSessionExpired: () => void;
};

export default function AdminAnalytics({ onBanner, onSessionExpired }: Props) {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/admin/overview', { credentials: 'include' });
        if (response.status === 401) {
          onSessionExpired();
          return;
        }
        const json = (await response.json()) as AnalyticsData & { ok?: boolean };
        if (!response.ok || !json.ok) {
          onBanner('error', 'Error', 'Could not load analytics.');
          return;
        }
        setData(json);
      } catch {
        onBanner('error', 'Error', 'Could not load analytics.');
      }
    })();
  }, [onBanner, onSessionExpired]);

  if (!data) {
    return (
      <section className="admin-card">
        <p className="admin-step">Analytics</p>
        <p className="admin-hint">Loading site metrics…</p>
      </section>
    );
  }

  const categoryEntries = Object.entries(data.site.byCategory);

  return (
    <>
      <section className="admin-card">
        <p className="admin-step">Analytics</p>
        <h2>Website snapshot</h2>
        <p className="admin-hint">
          Content and enquiry metrics from this site. Storage mode: {data.storage}.
        </p>

        <div className="admin-stat-grid">
          <div className="admin-stat">
            <span>Total enquiries</span>
            <strong>{data.requests.total}</strong>
          </div>
          <div className="admin-stat">
            <span>Enquiries (7 days)</span>
            <strong>{data.requests.last7Days}</strong>
          </div>
          <div className="admin-stat">
            <span>Social connected</span>
            <strong>
              {(data.connections.facebook ? 1 : 0) + (data.connections.instagram ? 1 : 0)}/2
            </strong>
          </div>
          <div className="admin-stat">
            <span>Published drafts</span>
            <strong>{data.site.drafts}</strong>
          </div>
        </div>
      </section>

      <section className="admin-card">
        <p className="admin-step">Content</p>
        <h2>Projects by division</h2>
        <div className="admin-bar-list">
          {categoryEntries.length === 0 ? (
            <p className="admin-empty">No projects found.</p>
          ) : (
            categoryEntries.map(([key, value]) => (
              <div key={key} className="admin-bar-row">
                <span>{key}</span>
                <div className="admin-bar-track">
                  <i style={{ width: `${Math.max(12, (value / data.site.projects) * 100)}%` }} />
                </div>
                <strong>{value}</strong>
              </div>
            ))
          )}
        </div>
        <p className="admin-hint" style={{ marginTop: 16 }}>
          {data.site.projects} projects · {data.site.photos} photos in the gallery.
        </p>
      </section>

      <section className="admin-card">
        <p className="admin-step">Request pipeline</p>
        <h2>Enquiry status</h2>
        <div className="admin-stat-grid four">
          <div className="admin-stat">
            <span>New</span>
            <strong>{data.requests.byStatus.new}</strong>
          </div>
          <div className="admin-stat">
            <span>In review</span>
            <strong>{data.requests.byStatus.reviewing}</strong>
          </div>
          <div className="admin-stat">
            <span>Done</span>
            <strong>{data.requests.byStatus.done}</strong>
          </div>
          <div className="admin-stat">
            <span>Archived</span>
            <strong>{data.requests.byStatus.archived}</strong>
          </div>
        </div>
      </section>

      <section className="admin-card">
        <p className="admin-step">Sitemap</p>
        <h2>Public pages</h2>
        <ul className="admin-page-list">
          {data.site.pages.map((page) => (
            <li key={page.path}>
              <a href={page.path} target="_blank" rel="noreferrer">
                {page.label}
              </a>
              <span>{page.path}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
