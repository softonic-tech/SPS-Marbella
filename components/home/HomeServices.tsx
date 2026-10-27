'use client';

import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import { useLanguage } from '@/lib/LanguageContext';
import { SERVICE_KEYS } from '@/lib/site';

export default function HomeServices() {
  const { t } = useLanguage();

  return (
    <section className="home-services">
      <div className="shell">
        <Reveal className="home-section-top">
          <div>
            <span className="home-index">02 · {t.explore}</span>
            <h2>{t.servicesTitle}</h2>
          </div>
          <p>{t.servicesDesc}</p>
        </Reveal>

        <Reveal className="simple-services">
          {SERVICE_KEYS.map((key, i) => (
            <Link className="simple-service" href={`/${key}`} key={key}>
              <span className="num">0{i + 1}</span>
              <h3>{t.nav[key]}</h3>
              <p>{t.services[key].lead}</p>
              <span className="go">—</span>
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
