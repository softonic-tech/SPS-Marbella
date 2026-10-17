import type { Metadata } from 'next';
import AboutQuote from '@/components/about/AboutQuote';
import AboutSection from '@/components/about/AboutSection';
import AboutStory from '@/components/about/AboutStory';
import FounderProfile from '@/components/about/FounderProfile';

export const metadata: Metadata = {
  title: 'About',
  description:
    'SPS Marbella brings architecture, construction, interiors and development together through one experienced point of contact. Founded by Sam Kader — 20+ years in construction, civil engineering degree, 80+ projects delivered.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About SPS Marbella',
    description:
      'Built on experience. Guided by one clear point of contact. Meet Sam Kader, founder and project director.',
    url: '/about',
  },
};

export default function AboutPage() {
  return (
    <>
      <AboutSection />
      <FounderProfile />
      <AboutStory />
      <AboutQuote />
    </>
  );
}
