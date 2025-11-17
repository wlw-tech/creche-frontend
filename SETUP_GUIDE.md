# 🚀 Crèche Frontend - Guide de Configuration

## 📋 Prérequis

- Node.js 18+
- npm ou yarn
- Backend API en cours d'exécution (http://localhost:3000)

## 🔧 Installation Complète

### 1. Cloner et Installer

```bash
cd creche-frontend
npm install
```

### 2. Configurer l'Environnement

```bash
cp .env.local.example .env.local
```

Éditer `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=Crèche WLW
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 3. Démarrer le Serveur

```bash
npm run dev
```

Ouvrir [http://localhost:3001](http://localhost:3001)

---

## 📁 Structure des Fichiers

### `lib/api.ts`
Client API centralisé avec tous les endpoints du backend.

**Utilisation**:
```typescript
import { apiClient } from '@/lib/api';

// Tous les endpoints disponibles
apiClient.loginAdmin(email, password)
apiClient.createClass(data)
apiClient.listClasses()
apiClient.getClassWithChildren(classeId)
// ... et plus
```

### `lib/store.ts`
Store Zustand pour gérer l'authentification.

**Utilisation**:
```typescript
import { useAuthStore } from '@/lib/store';

const { user, token, loginAdmin, loginUser, logout } = useAuthStore();
```

---

## 🔐 Authentification

### Login Admin

```typescript
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
  const { loginAdmin, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    try {
      await loginAdmin('admin@wlw.ma', 'change_me');
      // Rediriger vers dashboard
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

### Login Parent/Enseignant

```typescript
const { loginUser } = useAuthStore();

await loginUser('user@example.com', 'password');
```

---

## 🌐 Consommer l'API

### Exemple: Créer une Classe

```typescript
'use client';

import { apiClient } from '@/lib/api';
import { useState } from 'react';

export default function CreateClassPage() {
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const response = await apiClient.createClass({
        nom: 'Petite Section',
        trancheAge: 'PS',
        capacite: 20,
        active: true,
      });
      console.log('Classe créée:', response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleCreate} disabled={loading}>
      {loading ? 'Création...' : 'Créer Classe'}
    </button>
  );
}
```

### Exemple: Lister les Classes

```typescript
'use client';

import { apiClient } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await apiClient.listClasses();
        setClasses(response.data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      {classes.map((classe) => (
        <div key={classe.id}>
          <h3>{classe.nom}</h3>
          <p>Capacité: {classe.capacite}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎨 Tailwind CSS

Tailwind est déjà configuré. Utilisez les classes directement:

```tsx
<div className="flex items-center justify-center min-h-screen bg-gray-100">
  <div className="bg-white p-8 rounded-lg shadow-lg">
    <h1 className="text-2xl font-bold text-gray-900">Bienvenue</h1>
  </div>
</div>
```

---

## 📚 Endpoints Disponibles

Voir `creche-api-backend/API_COMPLETE_GUIDE.md` pour la liste complète.

### Authentification
- `POST /auth/login` - Login Admin
- `POST /auth/login-user` - Login User

### Admin
- `POST /admin/users` - Créer utilisateur
- `GET /admin/users` - Lister utilisateurs
- `POST /admin/classes` - Créer classe
- `GET /admin/classes` - Lister classes
- `GET /admin/classes/:id/enfants` - Voir classe avec enfants
- `POST /admin/classes/:id/enseignants/:id` - Assigner enseignant

### Enseignant
- `POST /presences/class` - Enregistrer présences
- `GET /presences` - Voir présences
- `POST /daily-resumes` - Créer résumé
- `GET /daily-resumes` - Voir résumés

### Parent
- `GET /parent/me` - Mon profil
- `GET /parent/enfants/:id/presences` - Présences enfant
- `GET /parent/enfants/:id/resume` - Résumé enfant
- `GET /parent/classes/:id/journal/latest` - Journal classe
- `GET /parent/classes/:id/menu` - Menu classe
- `POST /parent/me/change-password` - Changer mot de passe

---

## 🛠️ Commandes Utiles

```bash
# Développement
npm run dev

# Build pour production
npm run build

# Démarrer en production
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

---

## 🔗 Liens Utiles

- **Backend API**: http://localhost:3000/api
- **Swagger**: http://localhost:3000/api/docs
- **Frontend**: http://localhost:3001
- **Collection Postman**: `creche-api-backend/Creche-API.postman_collection.json`

---

## 📞 Troubleshooting

### Erreur: "Cannot find module '@/lib/api'"
- Vérifier que `tsconfig.json` contient `"@/*": ["./*"]`

### Erreur: "API not responding"
- Vérifier que le backend est en cours d'exécution
- Vérifier `NEXT_PUBLIC_API_URL` dans `.env.local`

### Erreur: "Token expired"
- Le token est automatiquement supprimé
- L'utilisateur est redirigé vers `/login`

---

**Prêt à développer!** 🚀

