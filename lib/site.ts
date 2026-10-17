import type { RouteKey, ServiceKey } from './i18n/types';

/**
 * Navigation order, matching the approved site.
 * `home` and `contact` are hidden on desktop by CSS and revealed in the
 * mobile drawer — see styles/07 and styles/09.
 */
export const NAV_ROUTES: readonly RouteKey[] = [
  'home',
  'architecture',
  'construction',
  'interiors',
  'development',
  'projects',
  'about',
  'contact',
];

export const SERVICE_KEYS: readonly ServiceKey[] = [
  'architecture',
  'construction',
  'interiors',
  'development',
];

/** Maps a route key to its Next.js path. */
export function routeHref(route: RouteKey): string {
  return route === 'home' ? '/' : `/${route}`;
}

/** Maps a pathname back to a route key (used for the active nav state). */
export function routeFromPathname(pathname: string): RouteKey {
  const segment = pathname.split('/').filter(Boolean)[0];
  if (!segment) return 'home';
  return (NAV_ROUTES as readonly string[]).includes(segment) ? (segment as RouteKey) : 'home';
}

/**
 * Header brand treatment.
 *  - 'logo'     renders the supplied SPS lockup
 *               (public/assets/sps-logo-mark.png — the supplied sps-logo.png
 *               with its flat beige plate knocked out so the mark sits directly
 *               on the page background, as the typographic version did)
 *  - 'wordmark' renders the typographic SPS / MARBELLA mark from the original HTML
 * Both occupy the identical 104 × 72 brand box, so the header layout is unchanged.
 */
export const HEADER_BRAND: 'logo' | 'wordmark' = 'logo';

/**
 * Enquiry inbox. Left empty in the approved build, which makes the contact form
 * show the "connect a contact email" notice instead of opening a mail client.
 * Add the client-approved address before launch.
 */
export const CONTACT_EMAIL = '';

/**
 * Representative architectural imagery used by the approved build.
 * Swap these for SPS photography in /public/assets when it is available —
 * nothing else needs to change.
 */
export const image = {
  hero: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2400&q=88',
  architecture:
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1700&q=85',
  construction:
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1700&q=85',
  interiors:
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1700&q=85',
  development:
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1700&q=85',
  project1: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1300&q=85',
  project2: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1300&q=85',
  project3: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1300&q=85',
  project4: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1300&q=85',
  project5: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1300&q=85',
  project6: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1300&q=85',
} as const;

export type ImageKey = keyof typeof image;

/** [imageKey, serviceCategory] — order matters, it drives the grid offsets. */
export const PROJECT_DATA: readonly (readonly [ImageKey, ServiceKey])[] = [
  ['project1', 'architecture'],
  ['project2', 'interiors'],
  ['project3', 'construction'],
  ['project4', 'development'],
  ['project5', 'interiors'],
  ['project6', 'architecture'],
];
