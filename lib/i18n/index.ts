import { en } from './en';
import { es } from './es';
import { sv } from './sv';
import type { Translation } from './types';

export const LANGUAGES = ['en', 'es', 'sv'] as const;
export type Language = (typeof LANGUAGES)[number];

/** Label shown in the header switcher */
export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'EN',
  es: 'ES',
  sv: 'SV',
};

export const DEFAULT_LANGUAGE: Language = 'en';

/** localStorage key used by the approved site — kept so existing visitors keep their choice. */
export const LANGUAGE_STORAGE_KEY = 'sps-lang';

export const dictionaries: Record<Language, Translation> = { en, es, sv };

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

export type * from './types';
