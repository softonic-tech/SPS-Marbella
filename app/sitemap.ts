import type { MetadataRoute } from 'next';
import { NAV_ROUTES, routeHref } from '@/lib/site';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return NAV_ROUTES.map((route) => ({
    url: new URL(routeHref(route), siteUrl).toString(),
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: route === 'home' ? 1 : 0.7,
  }));
}
