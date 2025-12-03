import { locales } from '@/lib/i18n/config';

export async function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }));
}

export const dynamicParams = false;
export const dynamic = 'force-static';
