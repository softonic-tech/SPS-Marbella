'use client';

import { useLanguage } from '@/lib/LanguageContext';

/**
 * The three approved founder statistics.
 *
 * They must stay on ONE horizontal row at every width:
 *   20+   Years in construction
 *   2011  Civil engineering degree
 *   80+   Projects delivered
 *
 * The three-column grid is locked in styles/10-final-overrides.css, which is
 * deliberately the last stylesheet imported.
 */
export default function StatsRow() {
  const { t } = useLanguage();

  return (
    <div className="founder-facts">
      {t.about.facts.map(([figure, label]) => (
        <div className="founder-fact" key={label}>
          <strong>{figure}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
