# 🚀 COMMENCER ICI - Crèche SaaS

Bienvenue! Voici comment démarrer avec votre application Crèche SaaS.

---

## 📋 Étape 1: Renommer le Dossier Backend

Le dossier `creche-api` doit être renommé en `creche-api-backend`.

**Voir**: `RENAME_BACKEND.md` pour les instructions détaillées.

```powershell
# Après fermeture de VS Code:
cd C:\Users\Douae\OneDrive\Desktop\creche-saas
Rename-Item -Path "creche-api" -NewName "creche-api-backend"
```

---

## 🔧 Étape 2: Démarrer le Backend

```bash
cd creche-api-backend
npm install
npm run dev
```

✅ Backend disponible à: **http://localhost:3000/api**
📖 Swagger: **http://localhost:3000/api/docs**

---

## 🎨 Étape 3: Démarrer le Frontend

```bash
cd creche-frontend
npm install
cp .env.local.example .env.local
npm run dev
```

✅ Frontend disponible à: **http://localhost:3001**

---

## 🔐 Étape 4: Tester l'Authentification

### Login Admin
```
Email: admin@wlw.ma
Password: change_me
```

### Tester avec Postman
1. Importer: `creche-api-backend/Creche-API.postman_collection.json`
2. Utiliser les endpoints pour tester l'API

---

## 📚 Documentation

### Backend
- **Guide Complet**: `creche-api-backend/API_COMPLETE_GUIDE.md`
- **Collection Postman**: `creche-api-backend/Creche-API.postman_collection.json`

### Frontend
- **README**: `creche-frontend/README.md`
- **Setup Guide**: `creche-frontend/SETUP_GUIDE.md`
- **Project Structure**: `creche-frontend/PROJECT_STRUCTURE.md`
- **Final Summary**: `creche-frontend/FINAL_SUMMARY.md`

---

## 🌐 Endpoints Disponibles

### Authentification
- `POST /auth/login` - Login Admin
- `POST /auth/login-user` - Login Parent/Enseignant

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

### Admin - Menus
- `POST /menus` - Créer menu
- `POST /menus/:id/publish` - Publier menu

### Parent Dashboard
- `GET /parent/me` - Mon profil
- `GET /parent/enfants/:id/presences` - Présences enfant
- `GET /parent/enfants/:id/resume` - Résumé enfant
- `GET /parent/classes/:id/journal/latest` - Journal classe
- `GET /parent/classes/:id/menu` - Menu classe
- `POST /parent/me/change-password` - Changer mot de passe

---

## 💻 Utiliser l'API dans le Frontend

### Client API
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
```

### Store Zustand
```typescript
import { useAuthStore } from '@/lib/store';

const { user, loginAdmin, logout } = useAuthStore();

// Login
await loginAdmin('admin@wlw.ma', 'change_me');

// Logout
logout();
```

---

## 🛠️ Commandes Utiles

### Backend
```bash
cd creche-api-backend
npm run dev          # Développement
npm run build        # Build
npm run start        # Production
npm run test         # Tests
```

### Frontend
```bash
cd creche-frontend
npm run dev          # Développement
npm run build        # Build
npm start            # Production
npm run lint         # Linting
```

---

## 📁 Structure du Projet

```
creche-saas/
├── creche-api-backend/
│   ├── src/
│   ├── API_COMPLETE_GUIDE.md
│   ├── Creche-API.postman_collection.json
│   └── ...
│
└── creche-frontend/
    ├── app/
    ├── lib/
    │   ├── api.ts
    │   └── store.ts
    ├── components/
    ├── README.md
    ├── SETUP_GUIDE.md
    └── ...
```

---

## 🎯 Prochaines Étapes

1. ✅ Renommer le dossier backend
2. ✅ Démarrer le backend
3. ✅ Démarrer le frontend
4. ✅ Tester l'authentification
5. ⏳ Créer les pages frontend
6. ⏳ Ajouter les composants
7. ⏳ Déployer en production

---

## 🔗 Liens Importants

| Lien | URL |
|------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:3000/api |
| Swagger | http://localhost:3000/api/docs |
| Postman | `creche-api-backend/Creche-API.postman_collection.json` |

---

## 📞 Besoin d'Aide?

1. **Problème de renommage?** → Voir `RENAME_BACKEND.md`
2. **Problème d'API?** → Voir `creche-api-backend/API_COMPLETE_GUIDE.md`
3. **Problème de frontend?** → Voir `creche-frontend/SETUP_GUIDE.md`
4. **Problème de structure?** → Voir `creche-frontend/PROJECT_STRUCTURE.md`

---

## ✅ Checklist

- [ ] Dossier backend renommé
- [ ] Backend démarré (http://localhost:3000/api)
- [ ] Frontend démarré (http://localhost:3001)
- [ ] Login admin testé
- [ ] Endpoints testés avec Postman
- [ ] Pages frontend créées
- [ ] Composants créés
- [ ] Déploiement en production

---

## 🎉 Résumé

Vous avez maintenant:
- ✅ Backend NestJS propre et organisé
- ✅ Frontend Next.js prêt à développer
- ✅ Client API centralisé
- ✅ State management avec Zustand
- ✅ Documentation complète
- ✅ 22 endpoints testables

**Prêt à développer!** 🚀

---

**Bonne chance!** 🎯

