'use client';

import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import { useLanguage } from '@/lib/LanguageContext';

export default function HomeIntro() {
  const { t } = useLanguage();

  return (
    <section className="home-intro">
      <Reveal className="shell home-intro-grid">
        <div>
          <span className="home-index">01 · {t.introEyebrow}</span>
          <h2>{t.introTitle}</h2>
        </div>
        <div className="home-intro-copy">
          <p>{t.introText}</p>
          <Link className="text-link" href="/about">
            {t.discover}
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
