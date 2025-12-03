import { locales } from '@/lib/i18n/config';

interface PathnameConfig {
  [key: string]: {
    [key: string]: string;
  };
}

export const pathnames: PathnameConfig = {
  '/': {
    fr: '/',
    ar: '/'
  },
  '/about': {
    fr: '/a-propos',
    ar: '/من-نحن'
  },
  // Ajoutez d'autres chemins ici au besoin
};

export type AppPathnames = keyof typeof pathnames;
