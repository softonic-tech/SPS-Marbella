'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import type { ServiceKey } from '@/lib/i18n/types';

/**
 * Decorative division marks. Hidden at every breakpoint in the approved
 * stylesheet (`.hero-division-icon{display:none}`) but kept here so the markup
 * matches the signed-off build and the icons can be re-enabled from CSS alone.
 */
const divisionIcons: Record<ServiceKey, string> = {
  architecture: 'M5 31h30M8 29V18l12-8 12 8v11M13 29V19l7-5 7 5v10M17 29v-8h6v8',
  construction: 'M7 16h24L20 7 7 16ZM13 16v17M27 16v17M10 33h21M20 7v26M27 11l6 5-5 4',
  interiors:
    'M7 19v-5c0-2 1-3 3-3h20c2 0 3 1 3 3v5M6 20c-2 0-3 1-3 3v8h34v-8c0-2-1-3-3-3s-3 1-3 3v3H9v-3c0-2-1-3-3-3ZM7 31v3M33 31v3',
  development: 'M6 33V23h5v10M15 33V17h5v16M24 33V11h5v22M4 33h30M7 18l8-6 6 1 10-8M27 5h4v4',
};

/** Renders a tagline that carries a hard line break. */
function Tagline({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={line}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
}

/**
 * The editorial landing hero: full-viewport artwork with the SPS identity block
 * and the four division columns. Desktop and mobile use different approved
 * artwork, swapped by `background-image` in styles/07 and styles/09 so each
 * layout keeps its own composition and crop.
 */
export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="editorial-hero" aria-label="SPS Marbella — one vision, four divisions">
      <div className="hero-identity">
        <div className="hero-identity-mark" aria-hidden="true">
          SPS
        </div>
        <div className="hero-identity-city">MARBELLA</div>
        <div className="hero-identity-line" />
        <div className="hero-identity-tag">One vision. Four divisions.</div>
      </div>

      <nav className="hero-divisions" aria-label="SPS divisions">
        {t.divisions.map(([key, label, tagline]) => (
          <Link className="hero-division" href={`/${key}`} key={key}>
            <span className="hero-division-icon">
              <svg viewBox="0 0 40 40" aria-hidden="true">
                <path d={divisionIcons[key]} />
              </svg>
            </span>
            <span className="hero-division-rule" />
            <h2>{label}</h2>
            <p>
              <Tagline text={tagline} />
            </p>
            <span className="hero-enter">{t.enter}</span>
            <span className="hero-chevron" aria-hidden="true">
              ›
            </span>
          </Link>
        ))}
      </nav>
    </section>
  );
}
