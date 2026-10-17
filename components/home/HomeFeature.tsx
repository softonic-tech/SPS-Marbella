'use client';

import Reveal from '@/components/ui/Reveal';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Split feature band. The image is a CSS background (see styles/08) so the
 * approved `center/cover` crop and the mobile reorder are preserved exactly.
 */
export default function HomeFeature() {
  const { t } = useLanguage();

  return (
    <section className="home-feature">
      <div className="home-feature-image" role="img" aria-label="Refined Marbella residence" />
      <Reveal className="home-feature-copy">
        <span className="home-index">SPS · MARBELLA</span>
        <h2>{t.whyTitle}</h2>
        <p>{t.whyDesc}</p>
      </Reveal>
    </section>
  );
}
