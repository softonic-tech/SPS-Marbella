import type { Metadata } from 'next';
import ServicePage from '@/components/services/ServicePage';

export const metadata: Metadata = {
  title: 'Construction',
  description:
    'Complete villa and apartment renovations and new builds in Marbella, coordinated from the first site decisions through to handover.',
  alternates: { canonical: '/construction' },
  openGraph: {
    title: 'Construction — SPS Marbella',
    description: 'The whole project, carried through with care.',
    url: '/construction',
  },
};

export default function ConstructionPage() {
  return <ServicePage service="construction" />;
}
