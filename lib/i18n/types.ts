/**
 * Shape of a complete SPS Marbella translation.
 * Every language file must satisfy this contract, so a missing string is a
 * compile-time error rather than an empty slot on the page.
 */

export type RouteKey =
  | 'home'
  | 'architecture'
  | 'construction'
  | 'interiors'
  | 'development'
  | 'projects'
  | 'about'
  | 'contact';

export type ServiceKey = 'architecture' | 'construction' | 'interiors' | 'development';

/** [heading, description] */
export type ValuePair = readonly [string, string];

/** [figure, label] — e.g. ['20+', 'Years in construction'] */
export type Fact = readonly [string, string];

/** [serviceKey, label, two-line tagline] */
export type Division = readonly [ServiceKey, string, string];

export interface ServiceCopy {
  /** Eyebrow kicker */
  k: string;
  title: string;
  lead: string;
  body: string;
  bullets: readonly string[];
}

export interface AboutCopy {
  k: string;
  title: string;
  desc: string;
  heading: string;
  body: string;
  body2: string;
  quote: string;
  quoteBy: string;
  /** About-page specific copy (founder profile + story) */
  intro: string;
  role: string;
  bio1: string;
  bio2: string;
  facts: readonly Fact[];
  story: string;
  storyBody: string;
  storyBody2: string;
}

export interface FormCopy {
  name: string;
  email: string;
  phone: string;
  type: string;
  select: string;
  options: readonly string[];
  message: string;
  send: string;
  required: string;
  success: string;
  mail: string;
}

export interface Translation {
  nav: Record<RouteKey, string>;
  heroK: string;
  heroTitle: string;
  heroText: string;
  contactUs: string;
  discover: string;
  heroNote: string;
  introEyebrow: string;
  introTitle: string;
  introText: string;
  explore: string;
  servicesTitle: string;
  servicesDesc: string;
  whyK: string;
  whyTitle: string;
  whyDesc: string;
  values: readonly ValuePair[];
  projectsTitle: string;
  projectsDesc: string;
  projectNote: string;
  projectLabels: readonly string[];
  allProjects: string;
  contactEyebrow: string;
  contactHeadline: string;
  contactBody: string;
  footerTag: string;
  rights: string;
  contactCta: string;
  contactNote: string;
  services: Record<ServiceKey, ServiceCopy>;
  projectPage: { k: string; title: string; desc: string };
  about: AboutCopy;
  contactPage: { k: string; title: string; desc: string };
  form: FormCopy;
  investorTitle: string;
  investorText: string;
  map: string;
  filters: readonly string[];
  /** Hero division tiles — taglines contain a hard line break */
  divisions: readonly Division[];
  /** "Enter" label beneath each hero division */
  enter: string;
}
