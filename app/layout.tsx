import type { Metadata, Viewport } from 'next';
import Header from '@/components/Header';
import { LanguageProvider } from '@/lib/LanguageContext';

// Stylesheet order mirrors the cascade of the approved index.html.
// Do not reorder — several blocks deliberately override earlier ones.
import '@/styles/01-base.css';
import '@/styles/02-sections.css';
import '@/styles/03-pages.css';
import '@/styles/04-about.css';
import '@/styles/05-utilities.css';
import '@/styles/06-responsive.css';
import '@/styles/07-editorial-header-hero.css';
import '@/styles/08-home-editorial.css';
import '@/styles/09-editorial-responsive.css';
import '@/styles/10-final-overrides.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const description =
  'SPS Marbella brings architecture, construction, interiors and development together in one considered, all-inclusive service.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'SPS Marbella — One vision. Four divisions.',
    template: '%s — SPS Marbella',
  },
  description,
  applicationName: 'SPS Marbella',
  keywords: [
    'SPS Marbella',
    'Marbella architecture',
    'Marbella construction',
    'villa renovation Marbella',
    'interior design Marbella',
    'property development Costa del Sol',
  ],
  authors: [{ name: 'SPS Marbella' }],
  alternates: {
    canonical: '/',
    languages: { en: '/', es: '/', sv: '/' },
  },
  openGraph: {
    type: 'website',
    siteName: 'SPS Marbella',
    title: 'SPS Marbella — One vision. Four divisions.',
    description,
    locale: 'en',
    alternateLocale: ['es', 'sv'],
    url: '/',
    images: [
      {
        url: '/assets/sps-hero-selected-clean.png',
        width: 1672,
        height: 941,
        alt: 'SPS Marbella — architecture, construction, interiors and development',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SPS Marbella — One vision. Four divisions.',
    description,
    images: ['/assets/sps-hero-selected-clean.png'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f5f1e9',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Playfair Display + DM Sans, loaded exactly as the approved build does.
            The lint rule below targets the Pages Router, where a <link> in a page
            would only apply to that page; here it lives in the root layout, so it
            applies site-wide. See the README for switching to next/font. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <LanguageProvider>
          <Header />
          <main id="app">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
