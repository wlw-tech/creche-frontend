'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * /auth/login is deprecated.
 * All authentication now goes through the unified login at the locale root (/).
 * This page simply redirects there.
 */
export default function LoginRedirectPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isArabic = pathname?.startsWith('/ar');
    const locale = isArabic ? 'ar' : 'fr';
    router.replace(`/${locale}`);
  }, [pathname, router]);

  return null;
}
