# PRD - Pexy (Leeloo AAC)

## 📋 Vue d'ensemble

### Objectif

Créer une application mobile de **Communication Alternative et Augmentée (AAC)** gratuite et accessible, permettant aux personnes ayant des difficultés de communication d'exprimer leurs besoins via des pictogrammes avec text-to-speech.

### Public cible

- Personnes autistes (TSA)
- Personnes avec aphasie
- Personnes avec troubles du langage
- Enfants en apprentissage du langage
- Aidants, parents, éducateurs, orthophonistes

### Problème résolu

Les solutions AAC existantes sont souvent :

- Coûteuses (plusieurs centaines d'euros)
- Complexes à configurer
- Nécessitent une connexion internet
- Peu personnalisables

**Pexy** offre une alternative moderne, gratuite, intuitive et 100% offline.

---

## 🎯 Fonctionnalités MVP (v1)

### 1. Onboarding

- **Écran de bienvenue** avec mascotte
- **Sélection d'avatar** personnalisé
  - Filtres : Garçon / Fille / Mixte
  - Grille de ~15 avatars mignons
- **Création de profil**
  - Champ : Prénom ou nom de profil
  - Validation et accès à l'app

### 2. Écran d'accueil

- **Barre de recherche** en haut
  - Placeholder : "Tapez vos phrases..."
  - Recherche dans pictogrammes et phrases
- **Grille de catégories thématiques** (tuiles colorées)
  - Favoris ⭐
  - Conversation 💬
  - Personnes 👥
  - Sentiments 😊
  - Nourriture 🍎
  - Animaux 🐱
  - L'école 📚
  - Activités 🎯
  - _(Plus de catégories à définir)_

### 3. Navigation par catégories

- **Page catégorie**
  - Titre + icône speaker 🔊 pour TTS du nom de catégorie
  - Grille de pictogrammes (3 colonnes)
  - Illustrations colorées + label textuel
  - Tap sur pictogramme → ouvre la page détail

### 4. Pictogrammes

- **Page détail d'un pictogramme**
  - Grand pictogramme central
  - Bouton shuffle/rotation (pour voir d'autres pictos similaires)
  - Bouton favoris ⭐ (toggle)
  - **Liste de phrases pré-construites** contextuelles
    - Emoji + texte de la phrase
    - Tap sur phrase → TTS la lit à voix haute
  - Bouton ➕ "Ajouter une nouvelle phrase" (gratuit)
  - Bouton fermer ✖️

### 5. Phrases pré-construites

- **Base de données de phrases** organisées par pictogramme
- Exemples (pour "Chat") :
  - ❤️ "J'aime les chats."
  - 🐱 "Pouvons-nous avoir un chat comme animal de compagnie ?"
  - 🥣 "Je dois nourrir mon chat."
  - 🛁 "Je dois nettoyer mon chat."
  - 🪢 "Je dois promener mon chat."
  - 👀 "J'ai vu un chat."
  - 🔊 "Quel bruit fait un chat ?"

### 6. Phrases personnalisées

- **Ajout de phrases custom**
  - Modal/écran avec champ texte
  - Sélection d'emoji optionnel
  - Sauvegarde dans la base locale
  - Associée au pictogramme actuel
- **Modification/Suppression**
  - Longpress sur phrase → options éditer/supprimer
  - Uniquement pour phrases custom (pas les pré-construites)

### 7. Text-to-Speech (TTS)

- **Lecture à voix haute**
  - Tap sur pictogramme → lit le label
  - Tap sur phrase → lit la phrase complète
  - Icône 🔊 visible sur éléments TTS-able
- **Voix native du système**
  - iOS : voix Siri
  - Android : voix Google TTS
- **Langue adaptative** (selon langue sélectionnée)

### 8. Favoris

- **Page dédiée "Favoris"**
  - Pictogrammes marqués en favoris
  - Accès rapide
  - Toggle favoris depuis page détail
- **Stockage local** (SQLite)

### 9. Recherche

- **Recherche globale**
  - Recherche dans labels de pictogrammes
  - Recherche dans textes de phrases
  - Affichage des résultats groupés
- **Page résultats de recherche**
  - Si mot correspond à un pictogramme → affiche ce picto en header
  - Liste des phrases contenant le mot recherché
  - Tap sur phrase → TTS

### 10. Paramètres (minimal MVP)

- **Écran paramètres**
  - Nom du profil (éditable)
  - Avatar (modifiable)
  - Langue de l'interface
  - Vitesse TTS (lent / normal / rapide)
  - À propos / Crédits

---

## 🏗️ Architecture technique

### Stack

- **Framework** : Expo / React Native
- **Langage** : TypeScript
- **Navigation** : Expo Router (file-based routing)
- **Stockage** : expo-sqlite (SQLite local)
- **TTS** : expo-speech
- **i18n** : react-i18next
- **State management** : React Context (ou Zustand si besoin)

### Stockage 100% local (offline-first)

#### Base de données SQLite

Tables principales :

```sql
-- Profil utilisateur
CREATE TABLE user_profile (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_id TEXT NOT NULL,
  language TEXT DEFAULT 'fr',
  tts_speed REAL DEFAULT 1.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Favoris
CREATE TABLE favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pictogram_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Phrases personnalisées
CREATE TABLE custom_phrases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pictogram_id TEXT NOT NULL,
  text TEXT NOT NULL,
  emoji TEXT,
  language TEXT DEFAULT 'fr',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Données pré-construites (JSON)

Structure des pictogrammes :

```json
{
  "pictograms": [
    {
      "id": "cat",
      "category": "animals",
      "image": "cat.png",
      "translations": {
        "fr": {
          "label": "Chat",
          "phrases": [
            { "emoji": "❤️", "text": "J'aime les chats." },
            { "emoji": "🐱", "text": "Pouvons-nous avoir un chat ?" },
            { "emoji": "🥣", "text": "Je dois nourrir mon chat." }
          ]
        },
        "en": {
          "label": "Cat",
          "phrases": [
            { "emoji": "❤️", "text": "I love cats." },
            { "emoji": "🐱", "text": "Can we have a cat?" },
            { "emoji": "🥣", "text": "I need to feed my cat." }
          ]
        }
      }
    }
  ],
  "categories": [
    {
      "id": "animals",
      "icon": "🐱",
      "color": "#FFE5E5",
      "translations": {
        "fr": "Animaux",
        "en": "Animals"
      }
    }
  ]
}
```

### Assets

- **Images bundlées** : pictogrammes par défaut inclus dans l'app
- **Images custom** : stockées localement via expo-file-system
- **Taille optimisée** : SVG ou PNG @2x/@3x

### Text-to-Speech

```javascript
import * as Speech from 'expo-speech';

const speakText = async (text: string, language: string = 'fr-FR') => {
  await Speech.speak(text, {
    language: language,
    pitch: 1.0,
    rate: userSettings.ttsSpeed, // 0.5 à 2.0
  });
};
```

### Internationalisation (i18n)

- **react-i18next** configuré dès le début
- **Langues prévues** : Français (MVP), Anglais, Espagnol, Allemand (futures)
- **Fichiers de traduction** : `/locales/fr.json`, `/locales/en.json`, etc.
- **Structure** :

```json
{
  "common": {
    "search_placeholder": "Tapez vos phrases...",
    "favorites": "Favoris",
    "add_phrase": "Ajouter une nouvelle phrase"
  },
  "categories": {
    "animals": "Animaux",
    "food": "Nourriture",
    "school": "L'école"
  }
}
```

---

## 🎨 Design & UX

### Style visuel

- **Illustrations** : mignonne, colorées, accessibles
- **Palette** : couleurs pastel douces
  - Vert menthe : `#D4F5E9`
  - Rose : `#FFE5E5`
  - Bleu clair : `#E5F2FF`
  - Jaune doux : `#FFF9E5`
- **Typographie** :
  - Sans-serif, haute lisibilité
  - Tailles adaptées (min 16px pour texte)
- **Iconographie** : émojis + illustrations custom

### Accessibilité

- **Contraste élevé** (WCAG AA minimum)
- **Zones tactiles larges** (min 44x44pt)
- **Pas de petits textes** (<14px)
- **Support lecteur d'écran** (iOS VoiceOver, Android TalkBack)
- **Animations réduites** (respecter preferReduceMotion)

### Navigation (Expo Router)

**File-based routing** : la structure de dossiers définit les routes automatiquement.

Structure proposée :

```
app/
├── _layout.tsx              # Layout racine (i18n, fonts, etc.)
├── index.tsx                # Route "/" - Splash/Redirect
├── (onboarding)/
│   ├── _layout.tsx          # Layout onboarding
│   ├── welcome.tsx          # Route "/onboarding/welcome"
│   ├── avatar.tsx           # Route "/onboarding/avatar"
│   └── profile.tsx          # Route "/onboarding/profile"
├── (main)/
│   ├── _layout.tsx          # Tab navigator (home/favorites/settings)
│   ├── index.tsx            # Route "/" (après onboarding) - Accueil
│   ├── favorites.tsx        # Route "/favorites"
│   └── settings.tsx         # Route "/settings"
├── category/
│   └── [id].tsx             # Route "/category/:id" - Page catégorie
├── pictogram/
│   └── [id].tsx             # Route "/pictogram/:id" - Détail pictogramme
├── search.tsx               # Route "/search" - Recherche
└── add-phrase.tsx           # Modal pour ajouter une phrase
```

**Avantages** :

- Deep linking automatique
- Navigation TypeScript-safe
- Moins de boilerplate
- Structure claire et organisée

### Responsive

- **Support** : smartphones et tablettes
- **Orientation** : portrait (priorité), paysage (nice-to-have)

---

## 🚀 Features futures (post-MVP)

### Phase 2

- **Historique** de phrases utilisées / phrase fréquentes
- **Plus de catégories** et pictogrammes
- **Thèmes visuels** (clair/sombre, taille police)
- **Backup/Restore**
  - Export JSON de la config
  - Import sur nouveau device
  - Intégration iCloud/Google Drive (optionnel)

### Phase 3

- **Mode hors-ligne avancé**
  - Téléchargement de voix TTS supplémentaires
- **Plus de langues** (Espagnol, Allemand, Italien, etc.)
- **Personnalisation avancée**
  - Upload de photos custom pour pictogrammes
  - Enregistrements audio custom

---

## 📅 Plan de développement

### 🎯 MVP (v1.0) - Milestones 1-6

#### Milestone 1 : Setup & Architecture (Semaine 1)

- [x] Init projet Expo
- [ ] Setup TypeScript
- [ ] Configurer Expo Router
- [ ] Structure de dossiers (app/)
- [ ] Configurer react-i18next
- [ ] Setup expo-sqlite
- [ ] Layouts de base (\_layout.tsx)

#### Milestone 2 : Onboarding (Semaine 1-2)

- [ ] Écran de bienvenue
- [ ] Sélection avatar
- [ ] Création profil
- [ ] Sauvegarde en SQLite

#### Milestone 3 : Core features (Semaine 2-4)

- [ ] Écran d'accueil avec catégories
- [ ] Page catégorie avec grille pictogrammes
- [ ] Page détail pictogramme
- [ ] Intégration TTS (expo-speech)
- [ ] Système de favoris
- [ ] Recherche

#### Milestone 4 : Phrases personnalisées (Semaine 4-5)

- [ ] Modal ajout phrase
- [ ] CRUD phrases custom
- [ ] Sauvegarde SQLite

#### Milestone 5 : Paramètres & Polish (Semaine 5-6)

- [ ] Écran paramètres
- [ ] Édition profil
- [ ] Réglages TTS
- [ ] Sélection langue
- [ ] Polish UI/UX
- [ ] Tests utilisateurs

#### Milestone 6 : Contenu & Lancement MVP (Semaine 6-7)

- [ ] Création/import pictogrammes (~200 minimum)
- [ ] Rédaction phrases pré-construites
- [ ] Traductions FR complètes
- [ ] Tests finaux
- [ ] Soumission stores (App Store, Google Play)
- [ ] 🚀 **Lancement MVP v1.0**

---

### 📈 Phase 2 (v1.1-1.2) - Post-lancement

#### Milestone 7 : Historique & Thèmes (2-3 semaines)

- [ ] **Historique de phrases**
  - [ ] Table SQLite pour historique
  - [ ] Page "Phrases fréquentes"
  - [ ] Affichage des phrases récemment utilisées
  - [ ] Clear historique
- [ ] **Thèmes visuels**
  - [ ] Mode sombre (dark mode)
  - [ ] Réglage taille de police (petit/normal/grand)
  - [ ] Sauvegarde préférences dans SQLite
  - [ ] Respect de preferColorScheme système

#### Milestone 8 : Backup/Restore (1-2 semaines)

- [ ] **Export de données**
  - [ ] Fonction export → fichier JSON
  - [ ] Inclure : profil, favoris, phrases custom, settings
  - [ ] Partage via expo-sharing
- [ ] **Import de données**
  - [ ] Sélection fichier JSON
  - [ ] Validation du format
  - [ ] Merge ou remplacement des données
- [ ] **Intégration cloud (optionnel)**
  - [ ] iCloud (iOS)
  - [ ] Google Drive (Android)
  - [ ] Backup automatique

#### Milestone 9 : Enrichissement contenu (continu)

- [ ] Extension des catégories (10-15 catégories)
- [ ] Ajout de pictogrammes (objectif : 400-500)
- [ ] Plus de phrases pré-construites par picto (moyenne 8-10)
- [ ] Feedback utilisateurs → ajustements

---

### 🌍 Phase 3 (v2.0) - International & Avancé

#### Milestone 10 : Multilingue (3-4 semaines)

- [ ] **Support Anglais (EN)**
  - [ ] Traduction interface complète
  - [ ] Traduction pictogrammes (labels + phrases)
  - [ ] TTS anglais
  - [ ] Tests avec locuteurs natifs
- [ ] **Support Espagnol (ES)**
  - [ ] Traduction interface
  - [ ] Traduction pictogrammes
  - [ ] TTS espagnol
- [ ] **Support Allemand (DE)** (optionnel)
  - [ ] Traduction interface
  - [ ] Traduction pictogrammes
  - [ ] TTS allemand
- [ ] **Support Italien (IT)** (optionnel)

#### Milestone 11 : Personnalisation avancée (2-3 semaines)

- [ ] **Upload photos custom**
  - [ ] expo-image-picker intégration
  - [ ] Créer pictogramme depuis photo
  - [ ] Stockage local (expo-file-system)
  - [ ] Gestion/suppression photos custom
- [ ] **Enregistrements audio custom**
  - [ ] expo-av pour enregistrement
  - [ ] Remplacer TTS par audio custom
  - [ ] Stockage local des fichiers audio
  - [ ] Player audio custom

#### Milestone 12 : Mode hors-ligne avancé (1-2 semaines)

- [ ] **Voix TTS supplémentaires**
  - [ ] Téléchargement de packs de voix
  - [ ] Stockage local
  - [ ] Sélection de la voix préférée
  - [ ] Gestion de l'espace disque
- [ ] **Optimisation offline**
  - [ ] Pré-chargement assets
  - [ ] Cache amélioré
  - [ ] 🚀 **Lancement v2.0**

---

## 📊 Métriques de succès

### MVP

- **Nombre de pictogrammes** : minimum 200
- **Catégories** : minimum 8
- **Phrases pré-construites** : moyenne de 5-7 par pictogramme
- **Langues** : 1 (Français)
- **Performance** : TTS < 500ms, navigation fluide 60fps

### Post-lancement

- **Téléchargements** : objectif 1000 en 3 mois
- **Rétention** : 40% à J7
- **Rating stores** : >4.5/5
- **Feedback utilisateurs** : sonder orthophonistes et familles

---

## ❓ Questions ouvertes

1. **Nom final** : "Pexy" ou "Leeloo AAC" ou autre ?
2. **Nombre de catégories MVP** : 8-10 ou plus ?
3. **Pictogrammes** : style unifié ? qui crée les illustrations ?
4. **Mascotte** : lapin blanc utilisé dans l'onboarding ?
5. **Monétisation future** : rester 100% gratuit ou premium features ?

---

## 📝 Notes importantes

- **Accessibilité = priorité #1**
- **Offline-first** : tout doit fonctionner sans internet
- **Gratuit pour toujours** : pas de paywall, pas de pub
- **Open source** : à considérer pour la communauté AAC
- **Privacy** : aucune donnée ne quitte l'appareil

---

**Date de création** : 14 février 2026
**Dernière mise à jour** : 14 février 2026
**Auteur** : Lucy
**Version** : 1.2 (Plan de développement complet : MVP + Phase 2 + Phase 3)
