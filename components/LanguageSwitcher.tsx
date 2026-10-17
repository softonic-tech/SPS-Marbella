'use client';

import { useLanguage } from '@/lib/LanguageContext';
import { LANGUAGES, LANGUAGE_LABELS } from '@/lib/i18n';

/**
 * EN / ES / SV switcher. The choice is kept in localStorage under `sps-lang`,
 * exactly as the approved site does, so a returning visitor keeps their language.
 */
export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="lang" aria-label="Choose language">
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          data-lang={code}
          className={code === lang ? 'active' : undefined}
          aria-current={code === lang ? 'true' : undefined}
          onClick={() => setLang(code)}
        >
          {LANGUAGE_LABELS[code]}
        </button>
      ))}
    </div>
  );
}
