# Contribuer à Pexy, pas à pas

[English](CONTRIBUTING.md) · **Français**

Merci de vouloir aider ! Ce guide est écrit pour les personnes qui débutent dans la contribution sur GitHub. Si une étape n'est pas claire, [ouvrez une issue](https://github.com/SLcode777/pexy/issues/new) et posez votre question : elles sont les bienvenues, en français ou en anglais.

Pour savoir ce qu'est l'application et connaître les règles du projet, lisez d'abord le [README](README.fr.md).

## Fork ou clone ? Les deux.

- **Fork** = votre propre copie du projet, *sur GitHub*, dans votre compte. Il est nécessaire parce que vous ne pouvez pas écrire directement dans le dépôt d'origine.
- **Clone** = une copie d'un dépôt *sur votre ordinateur*, pour pouvoir y travailler.

Le chemin est donc : forker Pexy sur GitHub, cloner **votre fork** sur votre ordinateur, travailler, envoyer votre travail sur votre fork, puis demander son ajout à Pexy avec une **pull request**.

```
SLcode777/pexy  ──fork──▶  votre-nom/pexy  ──clone──▶  votre ordinateur
      ▲                          ▲                          │
      └─────pull request─────────┴──────────push────────────┘
```

## Installation, une seule fois

1. Installez [Git](https://git-scm.com/downloads), [Node.js](https://nodejs.org) (version 22 ou plus récente) et [pnpm](https://pnpm.io/installation).
2. Sur la [page de Pexy](https://github.com/SLcode777/pexy), cliquez sur **Fork** (en haut à droite), puis sur **Create fork**.
3. Clonez votre fork (remplacez `votre-nom` par votre nom d'utilisateur GitHub) :

   ```bash
   git clone https://github.com/votre-nom/pexy.git
   cd pexy
   ```

4. Indiquez à Git où se trouve le projet d'origine, pour récupérer ses mises à jour plus tard. On l'appelle `upstream` :

   ```bash
   git remote add upstream https://github.com/SLcode777/pexy.git
   ```

5. Installez le projet et lancez-le :

   ```bash
   pnpm install
   pnpm start
   ```

   Ouvrez-le ensuite avec **Expo Go** sur votre téléphone (voir le [README](README.fr.md#lancer-lapplication-sur-votre-ordinateur), y compris la note sur Expo SDK 54).

## À chaque contribution

### 1. Choisir sur quoi travailler

Choisissez une [issue ouverte](https://github.com/SLcode777/pexy/issues) et laissez un commentaire du type « Je veux bien m'en occuper », pour que personne ne fasse le même travail en double. Pour une nouvelle idée, ouvrez d'abord une issue pour en discuter avant d'y passer du temps.

### 2. Partir d'un `master` à jour

```bash
git checkout master
git pull upstream master
```

### 3. Créer une branche

Une branche par sujet. Donnez-lui un nom court qui dit ce qu'elle fait :

```bash
git checkout -b fix-search-display
```

Ne travaillez jamais directement sur `master` : le garder propre rend l'étape 2 sans douleur la fois suivante.

### 4. Faire votre changement

- Restez concentré sur l'issue. Les petites pull requests sont relues plus vite.
- Vérifiez dans l'application que cela fonctionne, et que vous n'avez rien cassé autour.
- Avant de faire un commit, lancez les trois vérifications. Ce sont les mêmes que celles que GitHub lance sur votre pull request :

  ```bash
  pnpm test        # vérifie les données des pictogrammes et les traductions
  pnpm typecheck   # vérifie les types TypeScript
  pnpm lint        # vérifie le style du code
  ```
- Tout texte visible par l'utilisateur doit exister dans `locales/fr/translation.json` **et** dans `locales/en/translation.json`.
- Merci de ne pas modifier les phrases de `data/pictograms/` (voir le [README](README.fr.md#à-propos-des-phrases)). Proposez-les plutôt dans une issue.

### 5. Faire un commit

```bash
git status                  # voir ce qui a changé
git add chemin/du/fichier   # choisir les fichiers à inclure
git commit -m "Fix image display in search results"
```

Les messages de commit sont en anglais, commencent par un verbe et disent ce que fait le changement. Plusieurs petits commits, c'est très bien.

### 6. Envoyer sur votre fork

```bash
git push -u origin fix-search-display
```

### 7. Ouvrir la pull request

Allez sur votre fork sur GitHub : un bandeau jaune propose **Compare & pull request**. Cliquez dessus, puis :

- vérifiez que la base est bien `SLcode777/pexy` et `master` ;
- donnez un titre clair ;
- expliquez **ce que** vous avez changé et **pourquoi**, et ajoutez une capture d'écran si l'interface a changé ;
- écrivez `Closes #12` (avec le bon numéro) pour que l'issue se ferme toute seule quand la pull request est fusionnée.

Quelques secondes plus tard, GitHub lance les vérifications automatiquement : une coche verte signifie qu'elles passent, une croix rouge qu'une a échoué. Cliquez sur **Details** pour voir laquelle et pourquoi. Une croix rouge n'est pas un problème, c'est une information : corrigez, faites un commit, un push, et les vérifications se relancent.

Pas terminé, ou bloqué ? Ouvrez une **draft pull request** (brouillon) et posez votre question dedans.

### 8. La relecture

Vous recevrez peut-être des commentaires ou des demandes de modification. C'est normal, et c'est une conversation, pas un jugement. Pour mettre à jour votre pull request, faites un commit sur la même branche et renvoyez-la avec `git push` : la pull request se met à jour toute seule.

### 9. Après la fusion

```bash
git checkout master
git pull upstream master
git branch -d fix-search-display
```

## Quand quelque chose se passe mal

| Situation | Que faire |
| --- | --- |
| « J'ai travaillé sur `master` par erreur » | `git checkout -b ma-branche` déplace votre travail non commité sur une nouvelle branche. |
| « GitHub dit que ma branche a des conflits » | `git pull upstream master` sur votre branche, corrigez les fichiers marqués par `<<<<<<<`, puis commit et push. Demandez de l'aide dans la pull request si besoin. |
| « Expo Go refuse d'ouvrir le projet » | Voir la note sur le SDK 54 dans le [README](README.fr.md#lancer-lapplication-sur-votre-ordinateur). |
| « J'ai commité quelque chose que je n'aurais pas dû » | Pas de panique, et ne forcez rien : dites-le dans la pull request, on réglera ça ensemble. |

Ne commitez jamais de mots de passe, de clés ou de fichiers `.env`.

## Utiliser un assistant IA

Vous pouvez tout à fait en utiliser un. Le fichier [`AGENTS.md`](AGENTS.md) donne aux agents de code les règles du projet. Vous restez responsable de ce que vous proposez : relisez les changements, testez-les dans l'application, et soyez capable de les expliquer.

## Merci 🩵

Chaque contribution compte, y compris la correction d'une faute de frappe ou un bug bien décrit.
