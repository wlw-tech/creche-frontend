'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from './button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { locales, type Locale, localeNames, localeFlags } from '@/lib/i18n/config';
import { Globe } from 'lucide-react';

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: string) => {
    if (newLocale === currentLocale) return;
    
    // Remove the current locale from the pathname
    const segments = pathname.split('/').filter(Boolean);
    
    // If the first segment is a locale, replace it
    if (locales.includes(segments[0] as Locale)) {
      segments[0] = newLocale;
    } else {
      // If no locale in path, add it at the beginning
      segments.unshift(newLocale);
    }
    
    const newPath = '/' + segments.join('/');
    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{localeFlags[currentLocale]}</span>
          <span className="hidden sm:inline">{localeNames[currentLocale]}</span>
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem 
            key={locale} 
            onClick={() => switchLanguage(locale)}
            className="flex items-center gap-2"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            <span>{localeFlags[locale]}</span>
            <span>{localeNames[locale]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
