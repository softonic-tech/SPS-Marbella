'use client';

import Image from 'next/image';
import Reveal from '@/components/ui/Reveal';
import { useLanguage } from '@/lib/LanguageContext';
import { image, type ImageKey } from '@/lib/site';
import type { ServiceKey } from '@/lib/i18n/types';

const FEATURED: readonly (readonly [ImageKey, ServiceKey])[] = [
  ['project1', 'architecture'],
  ['project2', 'interiors'],
  ['project3', 'construction'],
];

export default function HomeProjects() {
  const { t } = useLanguage();

  return (
    <section className="home-projects">
      <div className="shell">
        <Reveal className="home-section-top">
          <div>
            <span className="home-index">04 · {t.nav.projects}</span>
            <h2>{t.projectsTitle}</h2>
          </div>
          <p>{t.projectsDesc}</p>
        </Reveal>

        <div className="home-project-grid">
          {FEATURED.map(([imageKey, category], i) => (
            <Reveal as="article" className="home-project" key={imageKey}>
              <Image
                src={image[imageKey]}
                alt={t.projectLabels[i]}
                width={1300}
                height={975}
                sizes="(max-width: 780px) 100vw, 33vw"
              />
              <span className="home-project-caption">
                <strong>{t.projectLabels[i]}</strong>
                <span>{t.nav[category]}</span>
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
