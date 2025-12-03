import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/lib/i18n/config';

export default createMiddleware({
  // Liste des langues supportées
  locales: locales,
  
  // Langue par défaut
  defaultLocale: defaultLocale,
  
  // Détection de la langue
  localePrefix: 'as-needed',
});

export const config = {
  // Matcher pour les routes qui nécessitent une gestion de la langue
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|json|xml|txt)$).*)',
  ],
};
