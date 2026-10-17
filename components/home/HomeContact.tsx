'use client';

import Reveal from '@/components/ui/Reveal';
import { useLanguage } from '@/lib/LanguageContext';

export default function HomeContact() {
  const { t } = useLanguage();

  return (
    <section className="home-contact">
      <Reveal className="shell">
        <span className="home-index">05 · {t.contactEyebrow}</span>
        <h2>{t.contactHeadline}</h2>
        <p>{t.contactBody}</p>
      </Reveal>
    </section>
  );
}
