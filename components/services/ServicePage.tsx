'use client';

import Image from 'next/image';
import ArrowButton from '@/components/ui/ArrowButton';
import ContactBand from '@/components/ui/ContactBand';
import PageHero from '@/components/ui/PageHero';
import { useLanguage } from '@/lib/LanguageContext';
import { image } from '@/lib/site';
import type { ServiceKey } from '@/lib/i18n/types';

/** One of the four division pages — Architecture, Construction, Interiors, Development. */
export default function ServicePage({ service }: { service: ServiceKey }) {
  const { t } = useLanguage();
  const s = t.services[service];

  return (
    <>
      <PageHero eyebrow={s.k} title={s.title} description={s.lead} />

      <Image
        className="page-image"
        src={image[service]}
        alt={s.title}
        width={1916}
        height={821}
        sizes="100vw"
      />

      <section className="section">
        <div className="shell content-split">
          <h2 className="serif">{s.lead}</h2>
          <div>
            <p>{s.body}</p>
            <div className="detail-list">
              {s.bullets.map((bullet, i) => (
                <div className="detail-item" key={bullet}>
                  <span className="eyebrow">0{i + 1} / </span>
                  {bullet}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {service === 'development' && (
        <section className="investor-callout">
          <div className="eyebrow">{t.nav.development}</div>
          <h2 className="serif">{t.investorTitle}</h2>
          <p>{t.investorText}</p>
          <ArrowButton href="/contact">{t.contactUs}</ArrowButton>
        </section>
      )}

      <ContactBand />
    </>
  );
}
