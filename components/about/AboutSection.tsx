'use client';

import { useLanguage } from '@/lib/LanguageContext';

/** About page opening band: eyebrow, title and the positioning paragraph. */
export default function AboutSection() {
  const { t } = useLanguage();

  return (
    <section className="about-hero">
      <div className="shell about-hero-grid">
        <div>
          <div className="eyebrow">{t.about.k}</div>
          <h1>{t.about.title}</h1>
        </div>
        <p>{t.about.intro}</p>
      </div>
    </section>
  );
}
