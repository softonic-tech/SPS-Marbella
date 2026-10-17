'use client';

import { useLanguage } from '@/lib/LanguageContext';

export default function AboutQuote() {
  const { t } = useLanguage();

  return (
    <section className="about-quote">
      <div className="shell">
        <blockquote>{t.about.quote}</blockquote>
        <span>{t.about.quoteBy}</span>
      </div>
    </section>
  );
}
