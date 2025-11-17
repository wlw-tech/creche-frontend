import { z } from 'zod';

// ============ AUTH ============
export const LoginRequestSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe requis'),
});

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    role: z.enum(['ADMIN', 'ENSEIGNANT', 'PARENT']),
    nom: z.string().optional(),
    prenom: z.string().optional(),
  }),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// ============ INSCRIPTIONS ============
export const InscriptionSchema = z.object({
  id: z.string(),
  statut: z.enum(['CANDIDATURE', 'EN_COURS', 'ACTIF', 'REJETEE']),
  creeLe: z.string().datetime(),
  modifieLe: z.string().datetime(),
  famille: z.object({
    nom: z.string(),
    prenom: z.string(),
    email: z.string(),
  }),
  enfants: z.array(
    z.object({
      nom: z.string(),
      prenom: z.string(),
      dateNaissance: z.string(),
    })
  ),
});

export type Inscription = z.infer<typeof InscriptionSchema>;

// ============ PRESENCES ============
export const PresenceSchema = z.object({
  id: z.string(),
  enfantId: z.string(),
  date: z.string(),
  statut: z.enum(['Present', 'Absent', 'Justifie']),
});

export type Presence = z.infer<typeof PresenceSchema>;

// ============ DAILY RESUMES ============
export const DailyResumeSchema = z.object({
  id: z.string(),
  enfantId: z.string(),
  enfantPrenom: z.string(),
  enfantNom: z.string(),
  date: z.string(),
  appetit: z.enum(['Excellent', 'Bon', 'Moyen', 'Faible', 'Refus']).optional(),
  humeur: z.enum(['Excellent', 'Bon', 'Moyen', 'Difficile', 'Tres_difficile']).optional(),
  sieste: z.enum(['Excellent', 'Bon', 'Moyen', 'Difficile', 'Pas_de_sieste']).optional(),
  participation: z.enum(['Excellent', 'Bon', 'Moyen', 'Faible', 'Absent']).optional(),
  observations: z.array(z.string()),
  creePar: z.string().optional(),
  creeLe: z.string().datetime(),
  modifieLe: z.string().datetime(),
});

export type DailyResume = z.infer<typeof DailyResumeSchema>;

// ============ MENUS ============
export const MenuSchema = z.object({
  id: z.string(),
  date: z.string(),
  entree: z.string().optional(),
  plat: z.string().optional(),
  dessert: z.string().optional(),
  statut: z.enum(['Brouillon', 'Publie']),
  allergenes: z.array(z.string()),
  creeLe: z.string().datetime(),
  modifieLe: z.string().datetime(),
});

export type Menu = z.infer<typeof MenuSchema>;

// ============ EVENTS ============
export const EventSchema = z.object({
  id: z.string(),
  titre: z.string(),
  description: z.string(),
  date: z.string().datetime(),
  audience: z.enum(['Parents', 'Enseignants', 'Tous']),
  classeId: z.string().optional(),
  creeLe: z.string().datetime(),
  modifieLe: z.string().datetime(),
});

export type Event = z.infer<typeof EventSchema>;

// ============ USERS ============
export const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.enum(['ADMIN', 'ENSEIGNANT', 'PARENT']),
  statut: z.enum(['INVITED', 'ACTIVE', 'DISABLED']),
  nom: z.string().optional(),
  prenom: z.string().optional(),
  telephone: z.string().optional(),
  creeLe: z.string().datetime(),
  modifieLe: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

