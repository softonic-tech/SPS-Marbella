'use client';

import Reveal from '@/components/ui/Reveal';
import { useLanguage } from '@/lib/LanguageContext';

export default function AboutStory() {
  const { t } = useLanguage();

  return (
    <section className="about-story">
      <div className="shell about-story-grid">
        <Reveal>
          <span className="home-index">SPS · MARBELLA</span>
          <h2>{t.about.story}</h2>
        </Reveal>
        <Reveal className="about-story-copy">
          <p>{t.about.storyBody}</p>
          <p>{t.about.storyBody2}</p>
        </Reveal>
      </div>
    </section>
  );
}
