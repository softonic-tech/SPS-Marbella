'use client';

import Link from 'next/link';
import ContactForm from './ContactForm';
import PageHero from '@/components/ui/PageHero';
import { useLanguage } from '@/lib/LanguageContext';

const MAPS_SEARCH_URL = 'https://www.google.com/maps/search/?api=1&query=Marbella%2C+Spain';
const MAPS_EMBED_URL = 'https://maps.google.com/maps?q=Marbella%2C%20Spain&z=12&output=embed';

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <>
      <PageHero
        eyebrow={t.contactPage.k}
        title={t.contactPage.title}
        description={t.contactPage.desc}
      />

      <section className="section">
        <div className="shell contact-layout">
          <div>
            <div className="eyebrow">{t.contactEyebrow}</div>
            <h2 className="serif">{t.contactHeadline}</h2>
            <p style={{ color: 'var(--muted)' }}>{t.contactBody}</p>

            <div className="contact-details">
              <div className="contact-row">
                <span>Location</span>
                <strong>Marbella, Spain</strong>
              </div>
              <div className="contact-row">
                <span>Email</span>
                <strong>{t.contactNote}</strong>
              </div>
              <div className="contact-row">
                <span>WhatsApp</span>
                <Link href="#contact-form">{t.contactUs} ↗</Link>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>

        <div className="shell">
          <div className="map-panel">
            <iframe
              title="Map of Marbella, Spain"
              src={MAPS_EMBED_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a className="map-link" href={MAPS_SEARCH_URL} target="_blank" rel="noreferrer">
              <strong>SPS Marbella</strong>
              <span>{t.map} ↗</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
