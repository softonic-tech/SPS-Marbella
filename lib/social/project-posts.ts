import { CLIENT_PROJECTS, type ClientProject, type ProjectStage } from '@/lib/projects';

export const STAGE_LABEL: Record<ProjectStage, string> = {
  before: 'Before',
  during: 'During',
  after: 'After',
  photos: 'Photographs',
};

export function projectById(id: string): ClientProject | null {
  return CLIENT_PROJECTS.find((project) => project.id === id) ?? null;
}

/** Public file path, with each segment encoded so Meta can fetch it. */
export function absoluteAssetUrl(origin: string, src: string) {
  const clean = src.startsWith('/') ? src : `/${src}`;
  const encoded = clean
    .split('/')
    .map((part) => (part ? encodeURIComponent(part) : ''))
    .join('/');
  return `${origin.replace(/\/$/, '')}${encoded}`;
}
