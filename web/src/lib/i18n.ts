/**
 * Internationalization (i18n) Configuration
 * Filipino (fil) and English (en) support
 */

export const locales = ['en', 'fil'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fil: 'Filipino',
};

/**
 * Load messages for a given locale
 */
export async function getMessages(locale: Locale) {
  try {
    return (await import(`@/messages/${locale}.json`)).default;
  } catch {
    return (await import(`@/messages/en.json`)).default;
  }
}

/**
 * Get the locale from cookies or default
 */
export function getLocaleFromCookie(): Locale {
  if (typeof document === 'undefined') return defaultLocale;
  const match = document.cookie.match(/bp_locale=(\w+)/);
  return (match?.[1] as Locale) || defaultLocale;
}

/**
 * Set locale cookie
 */
export function setLocaleCookie(locale: Locale): void {
  if (typeof document === 'undefined') return;
  document.cookie = `bp_locale=${locale};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`;
}
