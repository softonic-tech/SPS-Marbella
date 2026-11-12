'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ContactRequest, ContactRequestStatus } from '@/lib/admin/types';

type Props = {
  busy: boolean;
  onBusy: (next: boolean) => void;
  onBanner: (tone: 'info' | 'working' | 'success' | 'error', title: string, text: string) => void;
  onSessionExpired: () => void;
};

const STATUS_LABEL: Record<ContactRequestStatus, string> = {
  new: 'New',
  reviewing: 'In review',
  done: 'Done',
  archived: 'Archived',
};

export default function AdminRequests({ busy, onBusy, onBanner, onSessionExpired }: Props) {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [filter, setFilter] = useState<'all' | ContactRequestStatus>('all');
  const [selectedId, setSelectedId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/requests', { credentials: 'include' });
      if (response.status === 401) {
        onSessionExpired();
        return;
      }
      const data = (await response.json()) as { ok?: boolean; requests?: ContactRequest[] };
      const rows = data.requests || [];
      setRequests(rows);
      setSelectedId((current) => {
        if (current && rows.some((row) => row.id === current)) return current;
        return rows[0]?.id || '';
      });
    } catch {
      onBanner('error', 'Error', 'Could not load contact requests.');
    } finally {
      setLoading(false);
    }
  }, [onBanner, onSessionExpired]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = requests.find((item) => item.id === selectedId) || null;

  useEffect(() => {
    if (selected) setNotes(selected.notes || '');
  }, [selected]);

  const save = async (patch: Partial<Pick<ContactRequest, 'status' | 'notes'>>) => {
    if (!selected) return;
    onBusy(true);
    onBanner('working', 'Saving', 'Updating request…');
    try {
      const response = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: selected.id, ...patch }),
      });
      if (response.status === 401) {
        onSessionExpired();
        return;
      }
      const data = (await response.json()) as { ok?: boolean; request?: ContactRequest; error?: string };
      if (!response.ok || !data.ok || !data.request) {
        onBanner('error', 'Error', data.error || 'Could not update request.');
        return;
      }
      setRequests((current) => current.map((item) => (item.id === data.request!.id ? data.request! : item)));
      onBanner('success', 'Updated', `Request marked ${STATUS_LABEL[data.request.status]}.`);
    } catch {
      onBanner('error', 'Error', 'Could not update request.');
    } finally {
      onBusy(false);
    }
  };

  const visible = requests.filter((item) => (filter === 'all' ? true : item.status === filter));

  return (
    <section className="admin-card">
      <p className="admin-step">Inbox</p>
      <h2>Contact requests</h2>
      <p className="admin-hint">Review enquiries submitted from the website contact form.</p>

      <div className="admin-filter-row">
        {(['all', 'new', 'reviewing', 'done', 'archived'] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={`admin-chip ${filter === item ? 'on' : ''}`}
            onClick={() => setFilter(item)}
            disabled={busy}
          >
            {item === 'all' ? 'All' : STATUS_LABEL[item]}
          </button>
        ))}
        <button type="button" className="admin-btn ghost" onClick={() => void load()} disabled={busy || loading}>
          Refresh
        </button>
      </div>

      {loading ? <p className="admin-hint">Loading requests…</p> : null}

      {!loading && visible.length === 0 ? (
        <p className="admin-empty">No contact requests in this view yet.</p>
      ) : (
        <div className="admin-request-layout">
          <div className="admin-request-list">
            {visible.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`admin-request-item ${item.id === selectedId ? 'active' : ''}`}
                onClick={() => setSelectedId(item.id)}
                disabled={busy}
              >
                <strong>{item.name}</strong>
                <span>{item.projectType || 'General enquiry'}</span>
                <em>
                  {STATUS_LABEL[item.status]} · {new Date(item.createdAt).toLocaleString()}
                </em>
              </button>
            ))}
          </div>

          {selected ? (
            <div className="admin-request-detail">
              <p className="admin-step">{STATUS_LABEL[selected.status]}</p>
              <h3>{selected.name}</h3>
              <p className="admin-meta-line">
                <a href={`mailto:${selected.email}`}>{selected.email}</a>
                {selected.phone ? <> · <a href={`tel:${selected.phone}`}>{selected.phone}</a></> : null}
              </p>
              <p className="admin-meta-line">{selected.projectType || 'No project type selected'}</p>
              <p className="admin-request-message">{selected.message}</p>

              <label className="admin-field">
                Internal notes
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} disabled={busy} />
              </label>

              <div className="admin-actions wrap">
                <button type="button" className="admin-btn ghost" disabled={busy} onClick={() => void save({ notes })}>
                  Save notes
                </button>
                <button
                  type="button"
                  className="admin-btn ghost"
                  disabled={busy || selected.status === 'reviewing'}
                  onClick={() => void save({ status: 'reviewing', notes })}
                >
                  Mark in review
                </button>
                <button
                  type="button"
                  className="admin-btn"
                  disabled={busy || selected.status === 'done'}
                  onClick={() => void save({ status: 'done', notes })}
                >
                  Mark done
                </button>
                <button
                  type="button"
                  className="admin-btn ghost"
                  disabled={busy || selected.status === 'archived'}
                  onClick={() => void save({ status: 'archived', notes })}
                >
                  Archive
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
