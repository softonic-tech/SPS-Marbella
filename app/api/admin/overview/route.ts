import { NextResponse } from 'next/server';
import { contactRequestStats } from '@/lib/admin/requests-store';
import { CLIENT_PROJECTS } from '@/lib/projects';
import { isAdminAuthenticated } from '@/lib/social/auth';
import { resolveFacebookCreds, resolveInstagram, socialStatus } from '@/lib/social/meta';
import { listDrafts, readSocial, storageMode } from '@/lib/social/store';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const [requests, social, drafts] = await Promise.all([
    contactRequestStats(),
    readSocial(),
    listDrafts(),
  ]);
  const fb = resolveFacebookCreds(social);
  const ig = resolveInstagram(social);

  const mediaCount = CLIENT_PROJECTS.reduce(
    (sum, project) => sum + project.media.filter((item) => item.kind === 'image').length,
    0,
  );
  const byCategory = CLIENT_PROJECTS.reduce<Record<string, number>>((acc, project) => {
    acc[project.category] = (acc[project.category] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    ok: true,
    storage: storageMode(),
    social: socialStatus(social),
    connections: {
      facebook: Boolean(fb),
      facebookPage: fb?.pageName || '',
      instagram: Boolean(ig),
      instagramUsername: ig?.username || '',
    },
    requests,
    site: {
      projects: CLIENT_PROJECTS.length,
      photos: mediaCount,
      byCategory,
      drafts: drafts.length,
      pages: [
        { path: '/', label: 'Home' },
        { path: '/architecture', label: 'Architecture' },
        { path: '/construction', label: 'Construction' },
        { path: '/interiors', label: 'Interiors' },
        { path: '/development', label: 'Development' },
        { path: '/projects', label: 'Projects' },
        { path: '/about', label: 'About' },
        { path: '/contact', label: 'Contact' },
      ],
    },
  });
}
