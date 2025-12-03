'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { locales, type Locale, getLocaleDirection, isRTL } from '@/lib/i18n/config';

type I18nContextType = {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
  changeLocale: (newLocale: Locale) => void;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({
  children,
  initialLocale = 'fr',
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [dir, setDir] = useState<'ltr' | 'rtl'>(getLocaleDirection(initialLocale));
  const router = useRouter();
  const pathname = usePathname();

  const changeLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;

    // Update the URL with the new locale
    const segments = pathname.split('/');
    const currentLocale = locales.find(locale => segments.includes(locale));
    
    if (currentLocale) {
      segments[segments.indexOf(currentLocale)] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }

    const newPath = segments.join('/');
    router.push(newPath);
  };

  // Update document direction when locale changes
  useEffect(() => {
    const newDir = getLocaleDirection(locale);
    setDir(newDir);
    document.documentElement.dir = newDir;
    document.documentElement.lang = locale;
  }, [locale]);

  // Update locale when pathname changes
  useEffect(() => {
    const segments = pathname.split('/');
    const pathLocale = segments[1];
    
    if (locales.includes(pathLocale as Locale) && pathLocale !== locale) {
      setLocale(pathLocale as Locale);
    }
  }, [pathname, locale]);

  return (
    <I18nContext.Provider value={{ locale, dir, isRTL: isRTL(locale), changeLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
