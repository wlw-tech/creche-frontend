'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function UserLoginPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isArabic = pathname?.startsWith('/ar');
    const targetLocale = isArabic ? 'ar' : 'fr';
    router.replace(`/${targetLocale}`);
  }, [pathname, router]);

  return null;
}
