import type { Metadata } from 'next';
import AdminSocialPage from '@/components/admin/AdminSocialPage';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminSocialPage />;
}
