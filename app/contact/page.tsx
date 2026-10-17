import type { Metadata } from 'next';
import ContactPage from '@/components/contact/ContactPage';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Considering a complete renovation or a new home in Marbella? Tell us about your project and we will arrange a first conversation.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact — SPS Marbella',
    description: 'Begin a conversation about your project in Marbella.',
    url: '/contact',
  },
};

export default function Contact() {
  return <ContactPage />;
}
