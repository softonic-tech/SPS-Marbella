'use client';

import ArrowButton from './ArrowButton';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Dark call-to-action band that closes the inner pages.
 * The approved service pages show the headline and the button only; passing
 * `withBody` adds the supporting paragraph used by the long-form layout.
 */
export default function ContactBand({ withBody = false }: { withBody?: boolean }) {
  const { t } = useLanguage();

  return (
    <section className="contact-band">
      <div className="shell band-inner">
        <div>
          <div className="eyebrow">{t.contactEyebrow}</div>
          <h2 className="serif">{t.contactHeadline}</h2>
        </div>
        {withBody ? (
          <div>
            <p>{t.contactBody}</p>
            <ArrowButton href="/contact">{t.contactUs}</ArrowButton>
          </div>
        ) : (
          <ArrowButton href="/contact">{t.contactUs}</ArrowButton>
        )}
      </div>
    </section>
  );
}
