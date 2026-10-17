import type { Metadata } from 'next';
import ServicePage from '@/components/services/ServicePage';

export const metadata: Metadata = {
  title: 'Architecture',
  description:
    'Architectural concepts, detailed drawings and building licence support in Marbella — guiding your project from first ideas into a buildable plan.',
  alternates: { canonical: '/architecture' },
  openGraph: {
    title: 'Architecture — SPS Marbella',
    description: 'A clear vision for a home that belongs here.',
    url: '/architecture',
  },
};

export default function ArchitecturePage() {
  return <ServicePage service="architecture" />;
}
