'use client';

import { useMemo, useState } from 'react';
import { CLIENT_PROJECTS, type ClientProject, type ProjectStage } from '@/lib/projects';
import { MAX_PROJECT_PHOTOS, STAGE_LABEL } from '@/lib/social/project-posts';

const STAGES: readonly ProjectStage[] = ['before', 'during', 'after', 'photos'];

const KIND_LABEL = {
  newBuild: 'New build',
  basement: 'Basement renovation',
  extension: 'Extension & renovation',
  renovation: 'Renovation',
} as const;

const CATEGORY_LABEL = {
  architecture: 'Architecture',
  construction: 'Construction',
  interiors: 'Interiors',
  development: 'Development',
} as const;

function stagesOf(project: ClientProject) {
  const present = new Set(project.media.map((item) => item.stage));
  return STAGES.filter((stage) => present.has(stage));
}

type BannerTone = 'info' | 'working' | 'success' | 'error';

type Props = {
  facebookConnected: boolean;
  instagramConnected: boolean;
  busy: boolean;
  onBanner: (tone: BannerTone, title: string, text: string, phase?: 'idle' | 'posting' | 'posted' | 'error') => void;
};

export default function AdminProjectPublisher({
  facebookConnected,
  instagramConnected,
  busy,
  onBanner,
}: Props) {
  const [projectId, setProjectId] = useState(CLIENT_PROJECTS[0]?.id ?? '');
  const [stage, setStage] = useState<ProjectStage>(() => stagesOf(CLIENT_PROJECTS[0])[0] ?? 'photos');
  const [selected, setSelected] = useState<string[]>([]);
  const [caption, setCaption] = useState(
    CLIENT_PROJECTS[0]
      ? `${CLIENT_PROJECTS[0].name}\n${KIND_LABEL[CLIENT_PROJECTS[0].kind]} · ${CATEGORY_LABEL[CLIENT_PROJECTS[0].category]}\n\nSPS Marbella`
      : '',
  );
  const [postFacebook, setPostFacebook] = useState(true);
  const [postInstagram, setPostInstagram] = useState(false);

  const project = CLIENT_PROJECTS.find((item) => item.id === projectId) ?? CLIENT_PROJECTS[0];
  const stages = project ? stagesOf(project) : [];
  const currentStage = stages.includes(stage) ? stage : stages[0];
  const shown = project ? project.media.filter((item) => item.stage === currentStage) : [];
  const stageImages = shown.filter((item) => item.kind === 'image');

  const selectedCount = useMemo(() => {
    if (!project) return 0;
    const allowed = new Set(project.media.filter((item) => item.kind === 'image').map((item) => item.src));
    return selected.filter((src) => allowed.has(src)).length;
  }, [project, selected]);

  const chooseProject = (next: ClientProject) => {
    setProjectId(next.id);
    setStage(stagesOf(next)[0] ?? 'photos');
    setSelected([]);
    setCaption(`${next.name}\n${KIND_LABEL[next.kind]} · ${CATEGORY_LABEL[next.category]}\n\nSPS Marbella`);
  };

  const atLimit = selectedCount >= MAX_PROJECT_PHOTOS;

  const toggle = (src: string) => {
    if (selected.includes(src)) {
      setSelected((current) => current.filter((item) => item !== src));
      return;
    }
    if (selected.length >= MAX_PROJECT_PHOTOS) {
      onBanner(
        'info',
        'Limit reached',
        `You can publish up to ${MAX_PROJECT_PHOTOS} photos at a time. Deselect one to add another.`,
        'idle',
      );
      return;
    }
    setSelected((current) => [...current, src]);
  };

  const toggleStage = () => {
    const sources = stageImages.map((item) => item.src);
    const selectedInStage = sources.filter((src) => selected.includes(src));
    const allOn = sources.length > 0 && selectedInStage.length === sources.length;

    if (allOn) {
      setSelected((current) => current.filter((src) => !sources.includes(src)));
      return;
    }

    const room = MAX_PROJECT_PHOTOS - selected.length;
    const toAdd = sources.filter((src) => !selected.includes(src)).slice(0, Math.max(room, 0));
    if (toAdd.length === 0 && room === 0) {
      onBanner(
        'info',
        'Limit reached',
        `You can publish up to ${MAX_PROJECT_PHOTOS} photos at a time. Deselect one to add another.`,
        'idle',
      );
      return;
    }
    if (toAdd.length < sources.filter((src) => !selected.includes(src)).length) {
      onBanner(
        'info',
        'Limit reached',
        `Added what fits. Maximum is ${MAX_PROJECT_PHOTOS} photos per publish.`,
        'idle',
      );
    }
    setSelected((current) => [...new Set([...current, ...toAdd])]);
  };

  const publish = async () => {
    if (!project) return;
    if (!postFacebook && !postInstagram) {
      onBanner('error', 'Error', 'Choose Facebook or Instagram.', 'error');
      return;
    }
    if (postFacebook && !facebookConnected) {
      onBanner('error', 'Error', 'Connect Facebook first.', 'error');
      return;
    }
    if (postInstagram && !instagramConnected) {
      onBanner('error', 'Error', 'Connect Instagram first.', 'error');
      return;
    }
    if (selectedCount === 0) {
      onBanner('error', 'Error', 'Select at least one photo.', 'error');
      return;
    }
    if (selectedCount > MAX_PROJECT_PHOTOS) {
      onBanner('error', 'Error', `Select up to ${MAX_PROJECT_PHOTOS} photos at a time.`, 'error');
      return;
    }
    if (caption.trim().length < 8) {
      onBanner('error', 'Error', 'Write a longer caption.', 'error');
      return;
    }

    onBanner('working', 'Publishing', `Publishing ${selectedCount} photo${selectedCount === 1 ? '' : 's'}…`, 'posting');
    try {
      const response = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'publish-project',
          projectId: project.id,
          images: selected,
          caption,
          facebook: postFacebook,
          instagram: postInstagram,
        }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        posted?: number;
        failed?: number;
      };
      if (response.status === 401) {
        onBanner('error', 'Error', 'Session expired. Sign in again.', 'error');
        return;
      }
      if (!response.ok || !result.ok) {
        onBanner(
          'error',
          'Error',
          result.error || `Published ${result.posted ?? 0}, ${result.failed ?? 0} failed.`,
          'error',
        );
        return;
      }
      onBanner('success', 'Published', `Published ${result.posted ?? selectedCount} photo${(result.posted ?? selectedCount) === 1 ? '' : 's'}.`, 'posted');
      setSelected([]);
    } catch {
      onBanner('error', 'Error', 'Could not reach the publisher.', 'error');
    }
  };

  if (!project) return null;

  return (
    <section className="admin-card">
      <p className="admin-step">Step 2</p>
      <h2>Publish a project</h2>
      <p className="admin-hint">
        Choose a project, then select up to {MAX_PROJECT_PHOTOS} before, during, after, or photograph shots to post.
      </p>

      <div className="admin-projects">
        {CLIENT_PROJECTS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`admin-project ${item.id === project.id ? 'active' : ''}`}
            onClick={() => chooseProject(item)}
            disabled={busy}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.cover} alt="" />
            <span>
              <strong>{item.name}</strong>
              <em>
                {KIND_LABEL[item.kind]} · {CATEGORY_LABEL[item.category]}
              </em>
            </span>
          </button>
        ))}
      </div>

      <div className="admin-stages" role="tablist" aria-label={project.name}>
        {stages.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={item === currentStage}
            className={`admin-stage ${item === currentStage ? 'on' : ''}`}
            onClick={() => setStage(item)}
            disabled={busy}
          >
            {STAGE_LABEL[item]}
          </button>
        ))}
      </div>

      <div className="admin-stage-tools">
        <button type="button" className="admin-btn ghost" onClick={toggleStage} disabled={busy || stageImages.length === 0}>
          {stageImages.length > 0 && stageImages.every((item) => selected.includes(item.src))
            ? 'Clear this stage'
            : 'Select this stage'}
        </button>
        <span className={`admin-photo-count ${atLimit ? 'full' : ''}`}>
          {selectedCount} of {MAX_PROJECT_PHOTOS} selected
          {atLimit ? ' · limit reached' : ''}
        </span>
      </div>

      <div className="admin-photos">
        {shown.map((item) => {
          const isImage = item.kind === 'image';
          const on = selected.includes(item.src);
          const locked = isImage && !on && atLimit;
          return (
            <button
              key={item.src}
              type="button"
              className={`admin-photo ${on ? 'selected' : ''} ${isImage ? '' : 'video'} ${locked ? 'locked' : ''}`}
              onClick={() => isImage && toggle(item.src)}
              disabled={busy || !isImage || locked}
              aria-pressed={on}
              title={locked ? `Maximum ${MAX_PROJECT_PHOTOS} photos. Deselect one first.` : undefined}
            >
              {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.src} alt="" />
              ) : (
                <span className="admin-photo-video">Video</span>
              )}
              {on ? <span className="admin-photo-tick">Selected</span> : null}
              {locked ? <span className="admin-photo-tick muted">Full</span> : null}
            </button>
          );
        })}
      </div>

      <label className="admin-field">
        Caption
        <textarea value={caption} onChange={(event) => setCaption(event.target.value)} disabled={busy} />
      </label>
      <p className="admin-hint">Each photo is posted with this caption and its stage, such as Before or After.</p>

      <div className="admin-targets">
        <label className={`admin-target ${postFacebook ? '' : 'off'}`}>
          <input
            type="checkbox"
            checked={postFacebook}
            disabled={busy || !facebookConnected}
            onChange={(event) => setPostFacebook(event.target.checked)}
          />
          Facebook
        </label>
        <label className={`admin-target ${postInstagram ? '' : 'off'}`}>
          <input
            type="checkbox"
            checked={postInstagram}
            disabled={busy || !instagramConnected}
            onChange={(event) => setPostInstagram(event.target.checked)}
          />
          Instagram
        </label>
      </div>

      <div className="admin-actions">
        <button type="button" className="admin-btn wide" disabled={busy || selectedCount === 0} onClick={() => void publish()}>
          {busy ? 'Publishing…' : selectedCount ? `Publish ${selectedCount} photo${selectedCount === 1 ? '' : 's'}` : 'Publish photos'}
        </button>
      </div>
      {!facebookConnected && !instagramConnected ? (
        <p className="admin-hint">Connect Facebook above before publishing.</p>
      ) : null}
    </section>
  );
}
