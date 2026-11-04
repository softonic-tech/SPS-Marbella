'use client';

import Reveal from '@/components/ui/Reveal';
import { useLanguage } from '@/lib/LanguageContext';

export default function HomeMethod() {
  const { t } = useLanguage();

  return (
    <section className="home-method">
      <div className="shell method-grid">
        <Reveal>
          <span className="home-index">{t.whyK}</span>
          <h2>{t.whyTitle}</h2>
        </Reveal>

        <Reveal className="method-list">
          {t.values.map(([title, description]) => (
            <div className="method-row" key={title}>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
