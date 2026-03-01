'use client';

import { useState, useSyncExternalStore } from 'react';
import { locales, localeNames, getLocaleFromCookie, setLocaleCookie } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';
import { Globe } from 'lucide-react';

function getServerLocale(): Locale {
  return 'en';
}

export function LanguageSwitcher() {
  const currentLocale = useSyncExternalStore(
    () => () => {}, // no subscription needed — locale only changes on reload
    () => getLocaleFromCookie(),
    () => getServerLocale()
  );
  const [open, setOpen] = useState(false);
  const switchLocale = (locale: Locale) => {
    setLocaleCookie(locale);
    setOpen(false);
    // Reload to apply new locale
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        aria-label="Switch language"
      >
        <Globe className="h-4 w-4" />
        <span>{localeNames[currentLocale]}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[140px]">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => switchLocale(locale)}
                className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                  currentLocale === locale ? 'font-semibold text-blue-600 bg-blue-50' : 'text-gray-700'
                }`}
              >
                {localeNames[locale]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
