# 📸 Guide des Pictogrammes

## Workflow pour ajouter de nouvelles images

### 1️⃣ Ajouter les images
Placez vos fichiers `.webp` dans le dossier approprié :
```
assets/pictos/
├── school/
│   ├── book.webp
│   ├── pencil.webp
│   └── ...
├── animals/
│   └── ...
└── [autre-catégorie]/
```

### 2️⃣ Lancer le script automatique
```bash
npm run update-pictos
```

**Ce script fait automatiquement :**
- ✅ Scanne tous les dossiers `assets/pictos/`
- ✅ Met à jour les fichiers JSON dans `data/pictograms/`
- ✅ Génère le mapping pour React Native
- ✅ Match intelligemment les noms de fichiers avec les IDs

### 3️⃣ C'est tout ! 🎉

Les images s'afficheront automatiquement dans l'app avec le nouveau design :
- Image en plein écran
- Texte en overlay en bas

---

## Règles de nommage

Le script fait le matching automatique entre :
- Fichier : `school_bus.webp` ou `school-bus.webp`
- ID JSON : `"school-bus"`

Il gère automatiquement les `_` et `-` !

---

## Structure des fichiers

### JSON (`data/pictograms/school.json`)
```json
{
  "id": "book",
  "image": "assets/pictos/school/book.webp",
  "translations": { ... }
}
```

### Image
```
assets/pictos/school/book.webp
```

### Mapping généré (`components/PictogramImageMap.ts`)
```typescript
export const PICTOGRAM_IMAGE_MAP = {
  'assets/pictos/school/book.webp': require('@/assets/pictos/school/book.webp'),
  // ... auto-généré
};
```

---

## Commandes disponibles

```bash
# Met à jour les JSON + génère le mapping (recommandé)
npm run update-pictos

# Génère uniquement le mapping (si les JSON sont déjà à jour)
npm run generate-pictos
```

---

## Notes

- Les pictogrammes sans image `.webp` gardent leur emoji 👍
- Les deux formats coexistent parfaitement
- Le script gère automatiquement 800+ images
