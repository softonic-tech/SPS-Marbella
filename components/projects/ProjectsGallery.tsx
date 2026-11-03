'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import PageHero from '@/components/ui/PageHero';
import { useLanguage } from '@/lib/LanguageContext';
import type { ServiceKey } from '@/lib/i18n/types';
import {
  CLIENT_PROJECTS,
  type ClientProject,
  type ProjectStage,
} from '@/lib/projects';
import { SERVICE_KEYS } from '@/lib/site';

type Filter = 'all' | ServiceKey;

const STAGE_TABS: readonly ProjectStage[] = ['before', 'during', 'after', 'photos'];
const STAGE_PREFERENCE: readonly ProjectStage[] = ['after', 'photos', 'during', 'before'];

function stagesOf(project: ClientProject): ProjectStage[] {
  const present = new Set(project.media.map((item) => item.stage));
  return STAGE_TABS.filter((stage) => present.has(stage));
}

function preferredStage(stages: readonly ProjectStage[]): ProjectStage {
  return STAGE_PREFERENCE.find((stage) => stages.includes(stage)) ?? stages[0];
}

export default function ProjectsGallery() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<Filter>('all');
  const [activeId, setActiveId] = useState(CLIENT_PROJECTS[0].id);
  const [stage, setStage] = useState<ProjectStage>(() => preferredStage(stagesOf(CLIENT_PROJECTS[0])));
  const [lightbox, setLightbox] = useState<number | null>(null);

  const usedCategories = useMemo(
    () => new Set(CLIENT_PROJECTS.map((project) => project.category)),
    [],
  );
  const filters = useMemo(
    () => (['all', ...SERVICE_KEYS] as const).filter((key) => key === 'all' || usedCategories.has(key)),
    [usedCategories],
  );
  const visible = useMemo(
    () => CLIENT_PROJECTS.filter((project) => filter === 'all' || project.category === filter),
    [filter],
  );
  const active = visible.find((project) => project.id === activeId) ?? visible[0];
  const stages = active ? stagesOf(active) : [];
  const currentStage = active && stages.includes(stage) ? stage : stages[0];
  const shown = active ? active.media.filter((item) => item.stage === currentStage) : [];
  const images = shown.filter((item) => item.kind === 'image');

  useEffect(() => {
    if (lightbox == null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(null);
      if (event.key === 'ArrowRight') setLightbox((index) => (index == null ? index : (index + 1) % images.length));
      if (event.key === 'ArrowLeft') {
        setLightbox((index) => (index == null ? index : (index - 1 + images.length) % images.length));
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [lightbox, images.length]);

  function openProject(project: ClientProject) {
    setActiveId(project.id);
    setStage(preferredStage(stagesOf(project)));
    setLightbox(null);
  }

  const lightboxImage = lightbox != null ? images[lightbox] : undefined;

  return (
    <>
      <PageHero eyebrow={t.projectPage.k} title={t.projectPage.title} description={t.projectPage.desc} />

      <section className="section">
        <div className="shell">
          <div className="filters">
            {filters.map((key) => {
              const label = key === 'all' ? t.filters[0] : t.nav[key];
              return (
                <button
                  key={key}
                  type="button"
                  className={key === filter ? 'active' : undefined}
                  aria-pressed={key === filter}
                  onClick={() => {
                    setFilter(key);
                    const next = CLIENT_PROJECTS.find(
                      (project) => key === 'all' || project.category === key,
                    );
                    if (next) openProject(next);
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {active ? (
            <div className="project-studio">
              <ul className="project-index">
                {visible.map((project) => (
                  <li key={project.id}>
                    <button
                      type="button"
                      className={project.id === active.id ? 'active' : undefined}
                      aria-pressed={project.id === active.id}
                      onClick={() => openProject(project)}
                    >
                      <span className="project-index-thumb">
                        <Image src={project.cover} alt="" fill sizes="76px" className="project-shot-img" />
                      </span>
                      <span className="project-index-copy">
                        <strong>{project.name}</strong>
                        <span>{t.projectKinds[project.kind]}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <div>
                <div className="project-hero-photo">
                  <Image
                    src={active.cover}
                    alt={active.name}
                    fill
                    priority
                    sizes="(max-width: 980px) 100vw, 70vw"
                    className="project-shot-img"
                  />
                </div>
                <div className="project-hero-copy">
                  <span className="eyebrow">{t.nav[active.category]}</span>
                  <h2>{active.name}</h2>
                  <div className="project-hero-meta">
                    <span>{t.projectKinds[active.kind]}</span>
                    <span>
                      {shown.length} · {t.projectStudio[currentStage]}
                    </span>
                  </div>
                </div>

                {stages.length > 1 && (
                  <div className="project-stage" role="tablist" aria-label={active.name}>
                    {stages.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={item === currentStage ? 'active' : undefined}
                        aria-pressed={item === currentStage}
                        onClick={() => {
                          setStage(item);
                          setLightbox(null);
                        }}
                      >
                        {t.projectStudio[item]}
                      </button>
                    ))}
                  </div>
                )}

                <div className="project-grid">
                  {shown.map((item) =>
                    item.kind === 'video' ? (
                      <div className="project-video" key={item.src}>
                        <video src={item.src} controls playsInline preload="metadata" />
                      </div>
                    ) : (
                      <button
                        key={item.src}
                        type="button"
                        className="project-shot"
                        onClick={() => setLightbox(images.findIndex((image) => image.src === item.src))}
                      >
                        <Image
                          src={item.src}
                          alt={`${active.name}, ${t.projectStudio[currentStage]}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 24vw"
                          className="project-shot-img"
                        />
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="project-empty">{t.projectStudio.empty}</p>
          )}
        </div>
      </section>

      {lightboxImage && active && (
        <div className="project-lightbox" role="dialog" aria-modal="true" aria-label={active.name}>
          <div className="project-lightbox-bar">
            <span>
              {active.name} · {t.projectStudio[currentStage]}
            </span>
            <button type="button" onClick={() => setLightbox(null)}>
              {t.projectStudio.close}
            </button>
          </div>
          <div className="project-lightbox-frame">
            <Image
              src={lightboxImage.src}
              alt={`${active.name}, ${t.projectStudio[currentStage]}`}
              fill
              sizes="92vw"
              className="project-lightbox-img"
            />
          </div>
          <div className="project-lightbox-nav">
            <button
              type="button"
              onClick={() => setLightbox((index) => (index == null ? index : (index - 1 + images.length) % images.length))}
            >
              {t.projectStudio.previous}
            </button>
            <span>
              {(lightbox ?? 0) + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={() => setLightbox((index) => (index == null ? index : (index + 1) % images.length))}
            >
              {t.projectStudio.next}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
