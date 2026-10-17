import type { Metadata } from 'next';
import ServicePage from '@/components/services/ServicePage';

export const metadata: Metadata = {
  title: 'Interiors',
  description:
    'Interior concepts, custom carpentry and furniture made to measure, coordinated with the wider construction project.',
  alternates: { canonical: '/interiors' },
  openGraph: {
    title: 'Interiors — SPS Marbella',
    description: 'Made for your home. Made to fit.',
    url: '/interiors',
  },
};

export default function InteriorsPage() {
  return <ServicePage service="interiors" />;
}
