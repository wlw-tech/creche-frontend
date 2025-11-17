# 🎨 Crèche Frontend - Next.js + Tailwind

Frontend moderne pour l'application Crèche WLW.

## 🚀 Stack Technologique

- **Next.js 16** - Framework React
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **js-cookie** - Cookie management

## 📦 Installation

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer l'environnement
```bash
cp .env.local.example .env.local
```

Éditer `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=Crèche WLW
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 3. Démarrer le serveur
```bash
npm run dev
```

Ouvrir [http://localhost:3001](http://localhost:3001)

## 📁 Structure du Projet

```
creche-frontend/
├── app/                    # Pages Next.js
├── lib/
│   ├── api.ts             # Client API
│   └── store.ts           # Zustand store
├── components/            # Composants réutilisables
├── .env.local.example     # Variables d'environnement
└── package.json
```

## 🔐 Authentification

```typescript
import { useAuthStore } from '@/lib/store';

const { loginAdmin, loginUser, logout } = useAuthStore();

// Login Admin
await loginAdmin('admin@wlw.ma', 'change_me');

// Login User
await loginUser('user@example.com', 'password');

// Logout
logout();
```

## 🌐 Consommer l'API

```typescript
import { apiClient } from '@/lib/api';

// Créer une classe
await apiClient.createClass({
  nom: 'Petite Section',
  trancheAge: 'PS',
  capacite: 20,
  active: true,
});

// Lister les classes
const classes = await apiClient.listClasses();

// Voir classe avec enfants
const classData = await apiClient.getClassWithChildren('cls_1');
```

## 🛠️ Commandes

```bash
npm run dev      # Développement
npm run build    # Build
npm start        # Production
npm run lint     # Linting
```

## 🔗 Backend

- API: [http://localhost:3000/api](http://localhost:3000/api)
- Swagger: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- Guide: `creche-api-backend/API_COMPLETE_GUIDE.md`

---

**Prêt à développer!** 🚀
