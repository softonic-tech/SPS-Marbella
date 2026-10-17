import type { Metadata } from 'next';
import ProjectsGallery from '@/components/projects/ProjectsGallery';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'A considered approach to architecture, construction and interiors in Marbella — selected spaces from SPS Marbella.',
  alternates: { canonical: '/projects' },
  openGraph: {
    title: 'Projects — SPS Marbella',
    description: 'Spaces with a sense of place. Selected architecture, construction and interiors.',
    url: '/projects',
  },
};

export default function ProjectsPage() {
  return <ProjectsGallery />;
}
