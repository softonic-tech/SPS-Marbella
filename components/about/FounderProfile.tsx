'use client';

import Image from 'next/image';
import Reveal from '@/components/ui/Reveal';
import StatsRow from './StatsRow';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Founder band — portrait beside the biography.
 *
 * The portrait stays inside its bordered box at every width: the figure keeps
 * its 14px inset frame on desktop and drops to a 116px column with a 7px frame
 * on mobile (styles/04 and styles/06). On mobile `.founder-copy` becomes
 * `display:contents` so the heading, role and paragraphs flow into the same
 * grid as the portrait — which is why these children must stay direct
 * descendants of the `.founder-copy` element.
 */
export default function FounderProfile() {
  const { t } = useLanguage();

  return (
    <section className="founder">
      <div className="shell founder-grid">
        <Reveal as="figure" className="founder-portrait">
          <Image
            src="/assets/sam-kader.jpg"
            alt="Sam Kader, founder of SPS Marbella"
            width={1278}
            height={1230}
            sizes="(max-width: 780px) 120px, (max-width: 980px) 40vw, 36vw"
          />
        </Reveal>

        <Reveal className="founder-copy">
          <div className="eyebrow">{t.about.heading}</div>
          <h2>Sam Kader</h2>
          <div className="founder-role">{t.about.role}</div>
          <p>{t.about.bio1}</p>
          <p>{t.about.bio2}</p>
          <StatsRow />
        </Reveal>
      </div>
    </section>
  );
}
