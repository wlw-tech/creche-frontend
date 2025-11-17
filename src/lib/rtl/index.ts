/**
 * Utilitaires pour RTL (Right-to-Left)
 * Support pour l'arabe et autres langues RTL
 */

export type Direction = 'ltr' | 'rtl';

/**
 * Déterminer la direction basée sur la locale
 */
export function getDirection(locale: string): Direction {
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
}

/**
 * Obtenir la classe CSS pour la direction
 */
export function getDirectionClass(locale: string): string {
  return getDirection(locale) === 'rtl' ? 'rtl' : 'ltr';
}

/**
 * Propriétés logiques CSS pour padding
 * Utiliser ps (padding-start) et pe (padding-end) au lieu de pl/pr
 */
export function getPaddingClasses(
  locale: string,
  start?: string,
  end?: string
): string {
  const direction = getDirection(locale);
  if (direction === 'rtl') {
    return `${end ? `pr-${end}` : ''} ${start ? `pl-${start}` : ''}`.trim();
  }
  return `${start ? `pl-${start}` : ''} ${end ? `pr-${end}` : ''}`.trim();
}

/**
 * Propriétés logiques CSS pour margin
 */
export function getMarginClasses(
  locale: string,
  start?: string,
  end?: string
): string {
  const direction = getDirection(locale);
  if (direction === 'rtl') {
    return `${end ? `mr-${end}` : ''} ${start ? `ml-${start}` : ''}`.trim();
  }
  return `${start ? `ml-${start}` : ''} ${end ? `mr-${end}` : ''}`.trim();
}

/**
 * Obtenir la position de texte (left/right)
 */
export function getTextAlign(locale: string, align: 'start' | 'end' = 'start'): 'left' | 'right' {
  const direction = getDirection(locale);
  if (align === 'start') {
    return direction === 'rtl' ? 'right' : 'left';
  }
  return direction === 'rtl' ? 'left' : 'right';
}

/**
 * Obtenir la position de float (left/right)
 */
export function getFloat(locale: string, float: 'start' | 'end' = 'start'): 'left' | 'right' {
  const direction = getDirection(locale);
  if (float === 'start') {
    return direction === 'rtl' ? 'right' : 'left';
  }
  return direction === 'rtl' ? 'left' : 'right';
}

/**
 * Inverser une valeur pour RTL
 */
export function invertForRTL(locale: string, value: number): number {
  return getDirection(locale) === 'rtl' ? -value : value;
}

/**
 * Obtenir les classes Tailwind pour direction
 */
export function getDirectionTailwind(locale: string): {
  ps: string;
  pe: string;
  ms: string;
  me: string;
  text: string;
} {
  const direction = getDirection(locale);
  return {
    ps: direction === 'rtl' ? 'pr' : 'pl',
    pe: direction === 'rtl' ? 'pl' : 'pr',
    ms: direction === 'rtl' ? 'mr' : 'ml',
    me: direction === 'rtl' ? 'ml' : 'mr',
    text: direction === 'rtl' ? 'text-right' : 'text-left',
  };
}

