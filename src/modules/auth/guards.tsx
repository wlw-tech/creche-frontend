'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from './store';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: ('ADMIN' | 'ENSEIGNANT' | 'PARENT')[];
}

/**
 * Composant pour protéger les routes
 * Redirige vers / si non authentifié
 * Redirige vers / si rôle insuffisant
 */
export function ProtectedRoute({
  children,
  requiredRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token } = useAuthStore();

  // Vérifier l'authentification
  if (!token || !user) {
    const isArabic = pathname?.startsWith('/ar');
    const targetLocale = isArabic ? 'ar' : 'fr';
    router.push(`/${targetLocale}`);
    return null;
  }

  // Vérifier les rôles
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    router.push('/');
    return null;
  }

  return <>{children}</>;
}

/**
 * Hook pour vérifier les permissions
 */
export function useCanAccess(requiredRoles?: ('ADMIN' | 'ENSEIGNANT' | 'PARENT')[]) {
  const { user } = useAuthStore();

  if (!user) return false;
  if (!requiredRoles) return true;

  return requiredRoles.includes(user.role);
}

/**
 * Hook pour vérifier si l'utilisateur est admin
 */
export function useIsAdmin() {
  const { user } = useAuthStore();
  return user?.role === 'ADMIN';
}

/**
 * Hook pour vérifier si l'utilisateur est enseignant
 */
export function useIsTeacher() {
  const { user } = useAuthStore();
  return user?.role === 'ENSEIGNANT';
}

/**
 * Hook pour vérifier si l'utilisateur est parent
 */
export function useIsParent() {
  const { user } = useAuthStore();
  return user?.role === 'PARENT';
}

