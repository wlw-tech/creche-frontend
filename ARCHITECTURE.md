# Architecture Frontend - Crèche WLW

## 🏗️ Structure du Projet

```
src/
├── app/                          # App Router (Next.js 15)
│   ├── (auth)/
│   │   └── login/page.tsx       # Page de connexion
│   ├── (public)/
│   │   └── inscription/page.tsx # Formulaire d'inscription public
│   ├── (dashboard)/
│   │   ├── admin/               # Pages admin
│   │   ├── enseignant/          # Pages enseignant
│   │   └── parent/              # Pages parent
│   ├── layout.tsx               # Layout racine
│   └── globals.css              # Styles globaux
│
├── modules/                      # Feature modules (feature-first)
│   ├── auth/
│   │   ├── store.ts             # Zustand store (auth state)
│   │   └── guards.tsx           # RBAC guards & hooks
│   ├── api/
│   │   ├── client.ts            # Instance Ky + interceptors
│   │   └── contracts.ts         # Schémas Zod (validation)
│   ├── inscriptions/            # Feature: Inscriptions
│   │   ├── services.ts          # Logique métier
│   │   ├── hooks.ts             # Hooks React
│   │   └── components/          # Composants UI
│   ├── presences/               # Feature: Présences
│   ├── journal/                 # Feature: Journal quotidien
│   ├── menus/                   # Feature: Menus
│   ├── events/                  # Feature: Événements
│   ├── profil/                  # Feature: Profil utilisateur
│   └── common/                  # Composants réutilisables
│
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── charts/                  # Recharts wrappers
│   └── form/                    # react-hook-form wrappers
│
├── lib/
│   ├── i18n/
│   │   ├── config.ts            # Config next-intl
│   │   ├── fr.json              # Dictionnaire français
│   │   └── ar.json              # Dictionnaire arabe
│   ├── rtl/
│   │   └── index.ts             # Utilitaires RTL
│   ├── utils.ts                 # Utilitaires généraux
│   ├── constants.ts             # Constantes globales
│   └── date.ts                  # Utilitaires dates (dayjs)
│
├── hooks/
│   ├── use-toast.ts             # Hook toast
│   └── use-query-params.ts      # Hook query params
│
├── types/
│   └── domain.ts                # Types métier partagés
│
├── styles/
│   ├── tailwind.css             # Config Tailwind
│   └── theme.css                # Design tokens
│
└── tests/
    ├── e2e/                     # Tests Playwright
    └── unit/                    # Tests Vitest + RTL
```

## 🎯 Principes Architecturaux

### 1. **Feature-First Organization**
Chaque feature (inscriptions, presences, etc.) est un module autonome contenant:
- **services.ts**: Logique métier (appels API, transformations)
- **hooks.ts**: Hooks React (useQuery, useState, etc.)
- **components/**: Composants UI spécifiques
- **types.ts**: Types locaux (si nécessaire)

### 2. **Pages Minces**
Les pages (`app/*/page.tsx`) sont minces et délèguent la logique aux modules:
```tsx
// ✅ BON
export default function InscriptionsPage() {
  const { inscriptions } = useInscriptions();
  return <InscriptionsList data={inscriptions} />;
}

// ❌ MAUVAIS
export default function InscriptionsPage() {
  const [data, setData] = useState([]);
  useEffect(() => { /* logique */ }, []);
  return <div>...</div>;
}
```

### 3. **Contrats API Typés (Zod)**
Toutes les réponses API sont validées avec Zod:
```tsx
// src/modules/api/contracts.ts
export const InscriptionSchema = z.object({
  id: z.string(),
  statut: z.enum(['CANDIDATURE', 'EN_COURS', 'ACTIF', 'REJETEE']),
  // ...
});

// src/modules/inscriptions/services.ts
export async function getInscriptions() {
  const data = await apiGet('/inscriptions');
  return InscriptionSchema.array().parse(data);
}
```

### 4. **Client API Centralisé (Ky)**
Instance Ky unique avec:
- Injection JWT automatique
- Gestion erreurs 401/403
- Retry logic (optionnel)

```tsx
// src/modules/api/client.ts
export const api = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL,
  hooks: {
    beforeRequest: [authHeaderHook],
    afterResponse: [handleErrors],
  },
});
```

### 5. **State Management (Zustand)**
- **Auth store**: Zustand + localStorage (persistance)
- **Local state**: useState pour UI locale
- **Server state**: React Query (optionnel, pour cache avancé)

### 6. **i18n & RTL**
- **next-intl**: Dictionnaires FR/AR
- **Propriétés logiques CSS**: `ps-4` (padding-start) au lieu de `pl-4`
- **Direction HTML**: `dir="rtl"` pour arabe

### 7. **RBAC (Role-Based Access Control)**
Guards et hooks pour contrôler l'accès:
```tsx
// src/modules/auth/guards.tsx
export function ProtectedRoute({ children, requiredRoles }) {
  const { user } = useAuthStore();
  if (!requiredRoles.includes(user.role)) return null;
  return children;
}

// Utilisation
<ProtectedRoute requiredRoles={['ADMIN']}>
  <AdminDashboard />
</ProtectedRoute>
```

## 📦 Dépendances Clés

| Package | Rôle |
|---------|------|
| **next** | Framework React/SSR |
| **tailwindcss** | Styling utility-first |
| **shadcn/ui** | Composants UI accessibles |
| **zod** | Validation schémas |
| **ky** | Client HTTP léger |
| **zustand** | State management simple |
| **react-hook-form** | Gestion formulaires |
| **next-intl** | i18n (FR/AR) |
| **dayjs** | Manipulation dates |
| **recharts** | Graphiques |
| **sonner** | Toasts notifications |
| **@tanstack/react-query** | Cache réseau (optionnel) |

## 🔄 Flux de Données

```
User Action
    ↓
Component (UI)
    ↓
Hook (useInscriptions)
    ↓
Service (getInscriptions)
    ↓
API Client (ky)
    ↓
Backend API
    ↓
Zod Validation
    ↓
Store/State Update
    ↓
Re-render Component
```

## 🚀 Démarrage Rapide

### 1. Installation
```bash
cd creche-frontend
pnpm install
```

### 2. Variables d'environnement
```bash
cp .env.local.example .env.local
# Éditer .env.local avec vos valeurs
```

### 3. Développement
```bash
pnpm dev
# http://localhost:3001
```

### 4. Build
```bash
pnpm build
pnpm start
```

### 5. Tests
```bash
pnpm test              # Unit tests (Vitest)
pnpm test:e2e          # E2E tests (Playwright)
```

## 📋 Checklist Implémentation

- [ ] Configurer Tailwind + shadcn/ui
- [ ] Implémenter Auth (login, logout, guards)
- [ ] Créer pages Admin (inscriptions, menus, events)
- [ ] Créer pages Enseignant (presences, journal)
- [ ] Créer pages Parent (dashboard, presences, profil)
- [ ] Ajouter i18n (FR/AR)
- [ ] Tests unitaires
- [ ] Tests E2E
- [ ] Déploiement (Vercel)

## 🎨 Design System

### Couleurs (Tailwind)
- **Primary**: Blue-600 (#2563EB)
- **Success**: Green-600 (#16A34A)
- **Warning**: Amber-600 (#D97706)
- **Error**: Red-600 (#DC2626)
- **Muted**: Gray-500 (#6B7280)

### Spacing
- Utiliser l'échelle Tailwind (4px base)
- `p-4` = 16px, `p-8` = 32px, etc.

### Typography
- **Headings**: Geist Sans (bold)
- **Body**: Geist Sans (regular)
- **Mono**: Geist Mono (code)

## 📚 Ressources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Zod](https://zod.dev)
- [Zustand](https://github.com/pmndrs/zustand)
- [next-intl](https://next-intl-docs.vercel.app)

