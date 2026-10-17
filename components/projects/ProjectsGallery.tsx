'use client';

import Image from 'next/image';
import { useState } from 'react';
import PageHero from '@/components/ui/PageHero';
import { useLanguage } from '@/lib/LanguageContext';
import { PROJECT_DATA, SERVICE_KEYS, image } from '@/lib/site';
import type { ServiceKey } from '@/lib/i18n/types';

type Filter = 'all' | ServiceKey;

const FILTER_KEYS: readonly Filter[] = ['all', ...SERVICE_KEYS];

export default function ProjectsGallery() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<Filter>('all');

  return (
    <>
      <PageHero
        eyebrow={t.projectPage.k}
        title={t.projectPage.title}
        description={t.projectPage.desc}
      />

      <section className="section">
        <div className="shell">
          <div className="filters">
            {FILTER_KEYS.map((key, i) => (
              <button
                key={key}
                type="button"
                data-filter={key}
                className={key === filter ? 'active' : undefined}
                aria-pressed={key === filter}
                onClick={() => setFilter(key)}
              >
                {t.filters[i]}
              </button>
            ))}
          </div>

          <div className="gallery">
            {PROJECT_DATA.map(([imageKey, category], i) => {
              const hidden = filter !== 'all' && category !== filter;
              return (
                <article
                  className={hidden ? 'gallery-card hide' : 'gallery-card'}
                  data-category={category}
                  key={`${imageKey}-${i}`}
                >
                  <Image
                    src={image[imageKey]}
                    alt={t.nav[category]}
                    width={1300}
                    height={975}
                    sizes="(max-width: 480px) 100vw, (max-width: 780px) 50vw, 33vw"
                  />
                  <div className="project-info">
                    <h3>{t.projectLabels[i % 3]}</h3>
                    <span>{t.nav[category]}</span>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="gallery-disclaimer">{t.projectNote}</div>
        </div>
      </section>
    </>
  );
}
