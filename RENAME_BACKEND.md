# 📝 Instructions pour Renommer le Dossier Backend

## ⚠️ Problème

Le dossier `creche-api` n'a pas pu être renommé en `creche-api-backend` car il est verrouillé par VS Code.

## ✅ Solution

### Option 1: Fermer VS Code et Renommer

1. **Fermer VS Code complètement**
   - Fermer tous les onglets
   - Quitter l'application

2. **Ouvrir PowerShell**
   ```powershell
   cd C:\Users\Douae\OneDrive\Desktop\creche-saas
   ```

3. **Renommer le dossier**
   ```powershell
   Rename-Item -Path "creche-api" -NewName "creche-api-backend"
   ```

4. **Vérifier**
   ```powershell
   Get-ChildItem -Directory
   ```

5. **Rouvrir VS Code**
   ```powershell
   code .
   ```

---

### Option 2: Utiliser Git (Recommandé)

1. **Ouvrir PowerShell dans le dossier backend**
   ```powershell
   cd C:\Users\Douae\OneDrive\Desktop\creche-saas\creche-api
   ```

2. **Renommer avec Git**
   ```powershell
   git mv . ../creche-api-backend
   ```

3. **Faire un commit**
   ```powershell
   git commit -m "chore: Rename creche-api to creche-api-backend"
   ```

4. **Vérifier**
   ```powershell
   cd ..
   Get-ChildItem -Directory
   ```

---

### Option 3: Utiliser l'Explorateur Windows

1. **Ouvrir l'Explorateur Windows**
   - Aller à: `C:\Users\Douae\OneDrive\Desktop\creche-saas`

2. **Clic droit sur `creche-api`**
   - Sélectionner "Renommer"

3. **Taper le nouveau nom**
   - `creche-api-backend`

4. **Appuyer sur Entrée**

---

## 📋 Checklist Après Renommage

- [ ] Dossier renommé en `creche-api-backend`
- [ ] Vérifier que les fichiers sont intacts
- [ ] Vérifier que Git fonctionne
- [ ] Mettre à jour les chemins dans les scripts (si nécessaire)
- [ ] Mettre à jour la documentation (si nécessaire)

---

## 🔗 Chemins à Jour

Après renommage, les chemins seront:

```
C:\Users\Douae\OneDrive\Desktop\creche-saas\
├── creche-api-backend/          ← Nouveau nom
│   ├── src/
│   ├── API_COMPLETE_GUIDE.md
│   ├── Creche-API.postman_collection.json
│   └── ...
│
└── creche-frontend/
    ├── app/
    ├── lib/
    └── ...
```

---

## 📞 Besoin d'Aide?

Si le renommage échoue:

1. **Vérifier les processus verrouillant le dossier**
   ```powershell
   Get-Process | Where-Object {$_.Handles -gt 1000}
   ```

2. **Tuer les processus Node.js**
   ```powershell
   taskkill /F /IM node.exe
   ```

3. **Réessayer le renommage**

---

**Prêt à renommer!** 🚀

