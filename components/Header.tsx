'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/lib/LanguageContext';
import { HEADER_BRAND, NAV_ROUTES, routeFromPathname, routeHref } from '@/lib/site';

/**
 * Site header.
 *
 * The approved build toggles a `home-view` class when the landing page is
 * showing, which hides the brand, nav and contact pill and leaves only the
 * language switcher over the hero. Here that class lives on the header element
 * itself (see the note at the top of styles/07) and is derived from the route,
 * so it is correct in the server-rendered HTML — no flash, no hydration drift.
 */
export default function Header() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const route = routeFromPathname(pathname);
  const isHome = route === 'home';

  // The approved site closes the drawer on every navigation. Storing the route
  // the drawer was opened on means it closes itself when the route changes —
  // derived rather than reset from an effect.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const menuOpen = openedOn === pathname;

  if (pathname.startsWith('/admin')) return null;

  return (
    <header className={isHome ? 'site-header home-view' : 'site-header'}>
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="SPS Marbella home">
          {HEADER_BRAND === 'logo' ? (
            <Image
              src="/assets/sps-logo-mark.png"
              alt="SPS Marbella"
              width={750}
              height={425}
              priority
            />
          ) : (
            <>
              <span className="brand-mark">SPS</span>
              <span className="brand-city">MARBELLA</span>
            </>
          )}
        </Link>

        <nav
          className={menuOpen ? 'main-nav open' : 'main-nav'}
          id="mainNav"
          aria-label="Main navigation"
        >
          {NAV_ROUTES.map((key) => (
            <Link
              key={key}
              href={routeHref(key)}
              data-route={key}
              className={key === route ? 'active' : undefined}
              aria-current={key === route ? 'page' : undefined}
            >
              {t.nav[key]}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <LanguageSwitcher />
          <Link className="header-contact" href="/contact">
            Contact
          </Link>
          <button
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mainNav"
            onClick={() => setOpenedOn((opened) => (opened === pathname ? null : pathname))}
          >
            {menuOpen ? '×' : '☰'}
          </button>
        </div>
      </div>
    </header>
  );
}
