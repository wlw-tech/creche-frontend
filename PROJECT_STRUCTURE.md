# 📁 Structure du Projet Frontend

## 🎯 Vue d'ensemble

```
creche-saas/
├── creche-api-backend/          # Backend NestJS
│   ├── src/
│   ├── API_COMPLETE_GUIDE.md
│   ├── Creche-API.postman_collection.json
│   └── ...
│
└── creche-frontend/             # Frontend Next.js
    ├── app/                     # Pages et layouts
    │   ├── layout.tsx           # Layout principal
    │   ├── page.tsx             # Page d'accueil
    │   ├── globals.css          # Styles globaux
    │   └── ...
    │
    ├── lib/                     # Logique réutilisable
    │   ├── api.ts               # Client API
    │   └── store.ts             # Zustand store
    │
    ├── components/              # Composants React
    │   └── ...
    │
    ├── public/                  # Fichiers statiques
    │   └── ...
    │
    ├── .env.local.example       # Variables d'environnement
    ├── README.md                # Documentation
    ├── SETUP_GUIDE.md           # Guide de configuration
    ├── package.json             # Dépendances
    ├── tsconfig.json            # Configuration TypeScript
    ├── next.config.ts           # Configuration Next.js
    └── ...
```

---

## 📦 Dépendances Principales

### Production
- **next** - Framework React
- **react** - Bibliothèque UI
- **react-dom** - Rendu DOM
- **axios** - Client HTTP
- **zustand** - State management
- **js-cookie** - Gestion des cookies

### Développement
- **typescript** - Type safety
- **tailwindcss** - Styling
- **eslint** - Linting
- **@types/node** - Types Node.js
- **@types/react** - Types React

---

## 🔧 Fichiers Clés

### `lib/api.ts`
Client API centralisé avec tous les endpoints.

**Endpoints disponibles**:
- Authentification (login admin, login user)
- Utilisateurs (créer, lister)
- Classes (créer, lister, voir avec enfants, assigner enseignant)
- Présences (enregistrer, voir)
- Résumés (créer, voir)
- Menus (créer, publier)
- Parent Dashboard (profil, présences, résumés, journal, menu, change password)

### `lib/store.ts`
Store Zustand pour l'authentification.

**État**:
- `user` - Utilisateur connecté
- `token` - JWT token
- `isLoading` - État de chargement
- `error` - Messages d'erreur

**Actions**:
- `loginAdmin()` - Login admin
- `loginUser()` - Login parent/enseignant
- `logout()` - Déconnexion
- `setUser()` - Définir utilisateur
- `setToken()` - Définir token
- `initializeAuth()` - Initialiser auth

---

## 🚀 Démarrage Rapide

### 1. Installation
```bash
npm install
```

### 2. Configuration
```bash
cp .env.local.example .env.local
```

### 3. Démarrage
```bash
npm run dev
```

### 4. Ouvrir
```
http://localhost:3001
```

---

## 🔐 Authentification

### Flux de Login

```
1. Utilisateur entre email/password
   ↓
2. Appel apiClient.loginAdmin() ou loginUser()
   ↓
3. Backend retourne token + user info
   ↓
4. Token stocké dans cookie (js-cookie)
   ↓
5. Token ajouté automatiquement aux requêtes (intercepteur axios)
   ↓
6. Redirection vers dashboard
```

### Gestion du Token Expiré

```
1. Requête avec token expiré
   ↓
2. Backend retourne 401
   ↓
3. Intercepteur axios détecte 401
   ↓
4. Token supprimé du cookie
   ↓
5. Redirection vers /login
```

---

## 🌐 Consommer l'API

### Pattern Recommandé

```typescript
'use client';

import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export default function MyComponent() {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.listClasses();
        setData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur: {error.message}</p>;

  return (
    <div>
      {/* Afficher les données */}
    </div>
  );
}
```

---

## 🎨 Tailwind CSS

Tailwind est pré-configuré. Utilisez les classes directement:

```tsx
<div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
  <div className="bg-white p-8 rounded-lg shadow-2xl">
    <h1 className="text-3xl font-bold text-gray-900 mb-4">Bienvenue</h1>
    <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
      Cliquez-moi
    </button>
  </div>
</div>
```

---

## 🛠️ Commandes Disponibles

```bash
# Développement
npm run dev

# Build
npm run build

# Production
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

---

## 🔗 Liens Importants

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **Swagger**: http://localhost:3000/api/docs
- **Postman**: `creche-api-backend/Creche-API.postman_collection.json`

---

## 📚 Documentation

- **Frontend Setup**: `SETUP_GUIDE.md`
- **Backend API**: `creche-api-backend/API_COMPLETE_GUIDE.md`
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Zustand Docs**: https://github.com/pmndrs/zustand

---

## 🎯 Prochaines Étapes

1. ✅ Créer les pages de login
2. ✅ Créer les pages admin
3. ✅ Créer les pages enseignant
4. ✅ Créer les pages parent
5. ✅ Ajouter les composants réutilisables
6. ✅ Ajouter la validation des formulaires
7. ✅ Ajouter les notifications
8. ✅ Déployer en production

---

**Prêt à développer!** 🚀

