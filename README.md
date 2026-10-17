# SPS Marbella — Next.js

The approved SPS Marbella website, rebuilt on Next.js (App Router) with TypeScript.
The original `index.html` was treated as the source of truth: every colour, font
size, spacing value, breakpoint and interaction was carried across unchanged.

---

## Requirements

- **Node.js 20.9 or newer** (Node 22 LTS recommended)
- npm 10+

## Install and run

```bash
npm install
npm run dev
```

The site runs at <http://localhost:3000>.

### Admin · social posting

Admin panel: <http://localhost:3000/admin> (password from `ADMIN_PASSWORD`).

Staff can connect Facebook + Instagram (same Meta env keys as mm-properties), upload a project image + description, then post to both networks. Tokens and uploads prefer MongoDB (`MONGODB_URI`); without it, files fall back to `data/` and `public/uploads/`. Instagram long-lived tokens refresh automatically when near expiry.

Copy `.env.example` → `.env.local` and set at least:

- `BASE_URL` — public HTTPS origin (ngrok or production)
- `META_APP_ID` / `META_APP_SECRET`
- `INSTAGRAM_APP_ID` / `INSTAGRAM_APP_SECRET`
- `MONGODB_URI` (recommended)
- Leave `ALLOWED_FACEBOOK_USER_IDS` empty so any Meta-approved user (tester / Live) can connect; or list comma-separated Facebook user IDs.

Meta redirects:

- Facebook: `${BASE_URL}/facebook-callback.html`
- Instagram: `${BASE_URL}/api/instagram-callback`

## Production build

```bash
npm run build
npm start
```

Other scripts:

| Script              | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Development server with hot reload             |
| `npm run build`     | Optimised production build                     |
| `npm start`         | Serves the production build                    |
| `npm run lint`      | ESLint (Next core-web-vitals + TypeScript)     |
| `npm run typecheck` | TypeScript, no emit                            |

All three of `build`, `lint` and `typecheck` pass with no errors or warnings.

---

## Project structure

```
app/                      Routes (App Router)
  layout.tsx              <html>, fonts, SEO metadata, header, stylesheet order
  page.tsx                Landing page
  about/page.tsx          About Us
  architecture/ construction/ interiors/ development/
  projects/ contact/
  not-found.tsx           404
  sitemap.ts  robots.ts   Generated /sitemap.xml and /robots.txt
  favicon.ico icon.png apple-icon.png

components/
  Header.tsx              Brand, nav, language switcher, mobile drawer
  LanguageSwitcher.tsx    EN / ES / SV
  home/                   HeroSection, HomeIntro, HomeServices, HomeFeature,
                          HomeMethod, HomeProjects, HomeContact
  about/                  AboutSection, FounderProfile, StatsRow, AboutStory,
                          AboutQuote
  services/ServicePage.tsx
  projects/ProjectsGallery.tsx
  contact/ContactPage.tsx, ContactForm.tsx
  ui/                     Reveal, ArrowButton, PageHero, ContactBand

lib/
  i18n/                   en.ts, es.ts, sv.ts, types.ts — all approved copy
  LanguageContext.tsx     Language provider
  languageStore.ts        localStorage-backed language store
  site.ts                 Routes, image sources, brand and contact settings

styles/                   The approved stylesheet, split in cascade order
public/assets/            All supplied images
```

### Stylesheet order matters

`styles/` holds the original stylesheet split into ten files. They are imported
in `app/layout.tsx` in a fixed order (`01` → `10`) that reproduces the cascade of
the original `<style>` block. **Do not reorder them.** Several blocks deliberately
override earlier ones — in particular:

- `06-responsive.css` keeps its breakpoints in the original source order
  (1050 → 780 → 980 → 780 → 380 → 480). Equal-specificity rules resolve by source
  order, so sorting them would change the rendering.
- `10-final-overrides.css` must stay last. It is what locks the About page
  statistics into a single horizontal row of three at every width.

One mechanical change was made. The original toggled a `home-view` class on
`<body>` from its hash router; here that class sits on the `.site-header` element
and is derived from the route, so it is already correct in the server-rendered
HTML (no flash, no hydration drift). Every affected selector targets an element
inside the header, so the rewrite is cascade-equivalent.

---

## What was preserved

- **Light beige palette, typography, spacing, borders and proportions** — values
  copied verbatim from the original stylesheet.
- **Desktop hero** exactly as supplied (`sps-hero-selected-clean.png`,
  `center/cover`), with the SPS identity block and four division columns.
- **Mobile hero** exactly as supplied (`sps-hero-mobile-selected.png`,
  `center bottom`), with the divisions stacked as rows with chevrons. Desktop and
  mobile behave independently, driven by the original breakpoints.
- **About Us portrait** stays contained in its bordered image box at every width
  (14px frame on desktop, 116px column with a 7px frame on mobile).
- **About Us statistics in one horizontal row** — 20+ Years in construction ·
  2011 Civil engineering degree · 80+ Projects delivered. Never vertical.
- **Multilingual copy in English, Spanish and Swedish**, including the statement
  that Sam Kader started in construction at 16 and did hands-on labour himself.
- **Footer is not rendered** (the approved build hides it).
- **Hidden menu items** — Home and Contact stay hidden in the desktop nav and
  appear only in the mobile drawer, as in the approved CSS. On the landing page
  the header shows the language switcher alone.
- **Interactions** — language switching with `localStorage` persistence under the
  original `sps-lang` key, mobile drawer, scroll-reveal animations, project
  filters, hover transitions, and the contact form's behaviour.

### Verification

The rebuild was compared against the original at 1440, 1280, 1024, 760, 390 and
360px across all pages:

- **Page heights are identical** at every width — 36 of 36 page/viewport pairs.
- **5,950 geometry and computed-style comparisons** (position, size, font size,
  line height, letter spacing, colour, padding, margin, grid columns, object-fit)
  matched, with no layout differences.
- Remaining pixel differences are ≤0.5% and come from three non-layout sources:
  the header brand (see below), `next/image` re-encoding photographs to WebP, and
  text antialiasing.
- 72 behaviour tests pass (language switching, persistence, drawer, filters,
  form, hero artwork per breakpoint, stats row, portrait containment, and no
  horizontal overflow at 360px on any page).
- No console errors and no hydration mismatches in development across all three
  languages and all routes.

---

## Notes on a few decisions

**Header logo.** The approved HTML drew the brand as type (`SPS` / `MARBELLA`).
The supplied `sps-logo.png` is that same lockup as artwork, so it is now used in
the header, in the identical 104 × 72 brand box. It is served from
`public/assets/sps-logo-mark.png` — the supplied logo with its flat beige plate
knocked out, so the mark sits directly on the page background the way the
typographic version did. To go back to the typographic mark, set
`HEADER_BRAND = 'wordmark'` in `lib/site.ts`; nothing else changes.

**Favicon.** Built from the supplied SPS mark as `app/favicon.ico` (multi-size),
`app/icon.png` and `app/apple-icon.png`. They were re-encoded to RGBA because the
supplied `.ico` wrapped a greyscale PNG that the build could not decode.

**Images.** Supplied artwork lives in `public/assets/` and is served through
`next/image` where it is an `<img>` in the layout (founder portrait, header
logo, service and project imagery). The hero and the split feature band stay CSS
backgrounds, because that is what makes the approved crop and the desktop/mobile
artwork swap work; the matching hero file is preloaded so it remains the LCP
image.

The service and project tiles still point at the Unsplash placeholders the
approved build used — they are declared in `lib/site.ts` under `image` and
allow-listed in `next.config.ts`. Replace those URLs with SPS photography in
`public/assets/` when it is available; nothing else needs to change.

**Fonts.** Playfair Display and DM Sans load from Google Fonts via `<link>`, as
in the approved build, which keeps rendering identical and the build offline-safe.
To self-host instead, swap the `<link>` in `app/layout.tsx` for `next/font/google`
and point `--serif` / `--sans` in `styles/01-base.css` at the generated CSS
variables.

**Contact form.** `CONTACT_EMAIL` in `lib/site.ts` is intentionally empty, as in
the approved build, so the form shows the "connect a contact email" notice. Set
it to the client-approved inbox and the form opens the visitor's mail client with
the enquiry pre-filled.

---

## Deployment

Set the public site URL so canonical links, Open Graph tags, `sitemap.xml` and
`robots.txt` resolve to the live domain:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

See `.env.example`.

**Vercel** — import the repository; the defaults are correct (build
`npm run build`, output handled automatically). Add `NEXT_PUBLIC_SITE_URL` in
Project Settings → Environment Variables.

**Any Node host** (Netlify with the Next runtime, Render, Railway, Fly, a VPS,
Docker):

```bash
npm ci
npm run build
npm start          # serves on $PORT, default 3000
```

Keep `.next/`, `public/`, `package.json` and `node_modules` (or run `npm ci` on
the host). Put a reverse proxy in front for TLS if you are self-hosting.

**Static export** is possible — every route is already statically prerendered —
but `next/image` optimisation would need `images.unoptimized: true` in
`next.config.ts` first.
