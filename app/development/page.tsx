import type { Metadata } from 'next';
import ServicePage from '@/components/services/ServicePage';

export const metadata: Metadata = {
  title: 'Development',
  description:
    'Property sourcing, renovation planning and construction coordination for investors — one team from opportunity to finished property.',
  alternates: { canonical: '/development' },
  openGraph: {
    title: 'Development — SPS Marbella',
    description: 'A considered route from property to potential.',
    url: '/development',
  },
};

export default function DevelopmentPage() {
  return <ServicePage service="development" />;
}
