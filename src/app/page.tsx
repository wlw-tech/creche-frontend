'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale } from '@/lib/i18n/config';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la langue par défaut
    router.replace(`/${defaultLocale}`);
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px'
    }}>
      Redirection en cours...
    </div>
  );
}
