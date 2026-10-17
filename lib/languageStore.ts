import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, isLanguage, type Language } from './i18n';

/**
 * Tiny external store for the visitor's language choice.
 *
 * Backed by the same `sps-lang` localStorage key the approved site uses, and
 * exposed through the `useSyncExternalStore` contract so that:
 *  - the server and the hydrating client both render the default language
 *    (no hydration mismatch),
 *  - the stored preference is applied immediately after hydration,
 *  - a change in another tab is picked up automatically.
 */

let cached: Language | null = null;
const listeners = new Set<() => void>();

function readStorage(): Language {
  try {
    const value = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(value)) return value;
  } catch {
    // Private browsing or blocked storage — fall back to the default.
  }
  return DEFAULT_LANGUAGE;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function handleStorageEvent(event: StorageEvent) {
  if (event.key !== null && event.key !== LANGUAGE_STORAGE_KEY) return;
  cached = readStorage();
  emit();
}

export function subscribe(onStoreChange: () => void): () => void {
  if (listeners.size === 0) {
    window.addEventListener('storage', handleStorageEvent);
  }
  listeners.add(onStoreChange);

  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0) {
      window.removeEventListener('storage', handleStorageEvent);
    }
  };
}

/** Client snapshot — cached so the returned value is referentially stable. */
export function getSnapshot(): Language {
  if (cached === null) cached = readStorage();
  return cached;
}

/** Server/hydration snapshot — always the default, so SSR markup is stable. */
export function getServerSnapshot(): Language {
  return DEFAULT_LANGUAGE;
}

export function setLanguage(next: Language): void {
  if (cached === next) return;
  cached = next;
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
  } catch {
    // Preference will not persist, but the switch still works this session.
  }
  emit();
}
