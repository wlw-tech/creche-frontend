/**
 * Constantes globales
 */

export const APP_NAME = 'Crèche PetitsPas';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Rôles
export const ROLES = {
  ADMIN: 'ADMIN',
  ENSEIGNANT: 'ENSEIGNANT',
  PARENT: 'PARENT',
} as const;

// Statuts d'inscription
export const INSCRIPTION_STATUSES = {
  CANDIDATURE: 'CANDIDATURE',
  EN_COURS: 'EN_COURS',
  ACTIF: 'ACTIF',
  REJETEE: 'REJETEE',
} as const;

export const INSCRIPTION_STATUS_LABELS = {
  CANDIDATURE: 'Candidature',
  EN_COURS: 'En cours',
  ACTIF: 'Actif',
  REJETEE: 'Rejetée',
} as const;

// Statuts de présence
export const PRESENCE_STATUSES = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  JUSTIFIE: 'Justifie',
} as const;

export const PRESENCE_STATUS_LABELS = {
  Present: 'Présent',
  Absent: 'Absent',
  Justifie: 'Justifié',
} as const;

// Niveaux d'appétit
export const APPETIT_LEVELS = {
  EXCELLENT: 'Excellent',
  BON: 'Bon',
  MOYEN: 'Moyen',
  FAIBLE: 'Faible',
  REFUS: 'Refus',
} as const;

export const APPETIT_LABELS = {
  Excellent: '😋 Excellent',
  Bon: '😊 Bon',
  Moyen: '😐 Moyen',
  Faible: '😕 Faible',
  Refus: '🙅 Refus',
} as const;

// Niveaux d'humeur
export const HUMEUR_LEVELS = {
  EXCELLENT: 'Excellent',
  BON: 'Bon',
  MOYEN: 'Moyen',
  DIFFICILE: 'Difficile',
  TRES_DIFFICILE: 'Tres_difficile',
} as const;

export const HUMEUR_LABELS = {
  Excellent: '😄 Excellent',
  Bon: '😊 Bon',
  Moyen: '😐 Moyen',
  Difficile: '😠 Difficile',
  Tres_difficile: '😭 Très difficile',
} as const;

// Niveaux de sieste
export const SIESTE_LEVELS = {
  EXCELLENT: 'Excellent',
  BON: 'Bon',
  MOYEN: 'Moyen',
  DIFFICILE: 'Difficile',
  PAS_DE_SIESTE: 'Pas_de_sieste',
} as const;

export const SIESTE_LABELS = {
  Excellent: '😴 Excellent',
  Bon: '😴 Bon',
  Moyen: '😐 Moyen',
  Difficile: '😠 Difficile',
  Pas_de_sieste: '🚫 Pas de sieste',
} as const;

// Niveaux de participation
export const PARTICIPATION_LEVELS = {
  EXCELLENT: 'Excellent',
  BON: 'Bon',
  MOYEN: 'Moyen',
  FAIBLE: 'Faible',
  ABSENT: 'Absent',
} as const;

export const PARTICIPATION_LABELS = {
  Excellent: '⭐ Excellent',
  Bon: '👍 Bon',
  Moyen: '😐 Moyen',
  Faible: '👎 Faible',
  Absent: '❌ Absent',
} as const;

// Statuts de menu
export const MENU_STATUSES = {
  BROUILLON: 'Brouillon',
  PUBLIE: 'Publie',
} as const;

export const MENU_STATUS_LABELS = {
  Brouillon: 'Brouillon',
  Publie: 'Publié',
} as const;

// Audiences d'événement
export const EVENT_AUDIENCES = {
  PARENTS: 'Parents',
  ENSEIGNANTS: 'Enseignants',
  TOUS: 'Tous',
} as const;

export const EVENT_AUDIENCE_LABELS = {
  Parents: 'Parents',
  Enseignants: 'Enseignants',
  Tous: 'Tous',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZES = [10, 25, 50, 100];

// Délais
export const TOAST_DURATION = 3000;
export const DEBOUNCE_DELAY = 300;

