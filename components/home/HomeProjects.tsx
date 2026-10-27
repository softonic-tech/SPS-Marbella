'use client';

import Image from 'next/image';
import Reveal from '@/components/ui/Reveal';
import { useLanguage } from '@/lib/LanguageContext';
import type { ServiceKey } from '@/lib/i18n/types';

const FEATURED: readonly {
  src: string;
  width: number;
  height: number;
  category: ServiceKey;
}[] = [
  {
    src: '/assets/04-marbella-villa-entrance.png',
    width: 1536,
    height: 1024,
    category: 'architecture',
  },
  {
    src: '/assets/02-marbella-luxury-interior.png',
    width: 1677,
    height: 938,
    category: 'interiors',
  },
  {
    src: '/assets/03-marbella-terrace-pool.png',
    width: 1670,
    height: 941,
    category: 'construction',
  },
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
          {FEATURED.map((project, i) => (
            <Reveal as="article" className="home-project" key={project.src}>
              <Image
                src={project.src}
                alt={t.projectLabels[i]}
                width={project.width}
                height={project.height}
                sizes="(max-width: 780px) 100vw, 33vw"
              />
              <span className="home-project-caption">
                <strong>{t.projectLabels[i]}</strong>
                <span>{t.nav[project.category]}</span>
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
