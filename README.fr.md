<p align="center">
  <img src="assets/images/no-bg-Pexy-mascot.webp" alt="Pexy, le petit renard blanc mascotte de l'application" width="160">
</p>

<h1 align="center">Pexy</h1>

<p align="center">
  <a href="README.md">English</a> · <strong>Français</strong>
</p>

Pexy est une application gratuite de communication (CAA : Communication Alternative et Améliorée) pour les personnes qui ont du mal à parler : enfants et adultes autistes, personnes avec une aphasie ou un trouble du langage, et les parents, éducateurs et orthophonistes qui les accompagnent.

L'utilisateur touche un pictogramme, choisit une phrase toute prête, et le téléphone la dit à voix haute.

**[Télécharger Pexy sur Google Play](https://play.google.com/store/apps/details?id=com.lucysann.pexy)**

## Ce que fait l'application

- Une trentaine de catégories de pictogrammes (nourriture, émotions, animaux, école, médical...)
- Plusieurs phrases par pictogramme, lues par la voix du téléphone
- En français et en anglais
- Favoris, recherche, et catégories masquables pour garder une grille simple
- Pictogrammes personnalisés à partir de vos photos, et phrases personnalisées
- Export et import de vos données
- Fonctionne entièrement hors ligne. Pas de compte, pas de publicité, rien ne quitte l'appareil.

## Contribuer

Les contributions sont les bienvenues, quel que soit votre niveau. Pas besoin d'être développeur pour aider.

Les issues et les pull requests peuvent être rédigées en **français ou en anglais**.

### Aider sans écrire de code

- **Dites-nous ce qui marche et ce qui ne marche pas.** Si vous utilisez Pexy avec un enfant, un élève ou un patient, vos retours sont ce que vous pouvez apporter de plus précieux. [Ouvrez une issue](https://github.com/SLcode777/pexy/issues/new) et décrivez ce qui s'est passé ou ce qui manque.
- **Corrigez une traduction** dans les menus de l'application : [`locales/fr/translation.json`](locales/fr/translation.json) et [`locales/en/translation.json`](locales/en/translation.json).

Une correction de traduction peut se faire directement sur GitHub : ouvrez le fichier, cliquez sur l'icône crayon, faites votre changement, et GitHub vous guide pour créer une pull request.

### À propos des phrases

Les phrases de chaque pictogramme (dans [`data/pictograms/`](data/pictograms)) sont écrites et maintenues par l'autrice : merci de **ne pas les modifier dans une pull request**. Si vous pensez qu'une phrase manque ou pourrait être meilleure, [ouvrez une issue](https://github.com/SLcode777/pexy/issues/new) pour la suggérer. Voici les principes qu'elles suivent :

1. **Une phrase doit servir dans une conversation** : demander quelque chose (« Puis-je avoir une pomme ? »), dire ce qu'on veut ou ce qu'on aime (« J'aime les pommes. »), proposer (« Veux-tu une pomme ? »), poser une question, ou prévenir (« Attention, c'est chaud ! »). Évitez les phrases qui ne font que décrire une image (« La pomme est rouge. »).
2. **Ne supprimez jamais une phrase existante.** Beaucoup d'utilisateurs connaissent leurs phrases par cœur et s'appuient dessus. Ajoutez plutôt de nouvelles phrases. Si une ancienne phrase est moins utile, déplacez-la en fin de liste.
3. **Gardez le français et l'anglais en miroir** : même nombre de phrases, dans le même ordre, avec le même emoji.
4. **En français**, on tutoie, et on met une espace avant `?` et `!` (« Aimes-tu les pommes ? »). **En anglais**, pas d'espace avant ces signes.
5. Gardez des phrases courtes et simples.

### Lancer l'application sur votre ordinateur

Il vous faut [Node.js](https://nodejs.org) (version 22 ou plus récente), [pnpm](https://pnpm.io/installation) et un téléphone.

```bash
git clone https://github.com/SLcode777/pexy.git
cd pexy
pnpm install
pnpm start
```

Installez ensuite **Expo Go** sur votre téléphone et scannez le QR code affiché dans le terminal. Le téléphone et l'ordinateur doivent être sur le même réseau Wi-Fi.

> Pexy utilise actuellement **Expo SDK 54**. L'application Expo Go du store peut être plus récente et refuser d'ouvrir le projet. Dans ce cas, installez la [version d'Expo Go pour le SDK 54](https://expo.dev/go), ou branchez un téléphone Android en USB, appuyez sur `a` dans le terminal et acceptez quand Expo propose d'installer la bonne version.

### Proposer un changement

Vous débutez dans la contribution sur GitHub ? Suivez le **[guide pas à pas](CONTRIBUTING.fr.md)** (fork, branche, pull request). En résumé :

1. Choisissez une [issue ouverte](https://github.com/SLcode777/pexy/issues), ou ouvrez-en une nouvelle pour discuter de votre idée. Laissez un commentaire pour dire que vous travaillez dessus.
2. Faites un [fork](https://docs.github.com/fr/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) du dépôt et créez une branche pour votre changement.
3. Faites votre changement et vérifiez que l'application se lance toujours. Lancez `pnpm test`, `pnpm typecheck` et `pnpm lint`.
4. Ouvrez une pull request vers `master`. Expliquez ce que vous avez changé et pourquoi, et ajoutez une capture d'écran si cela modifie ce que voit l'utilisateur.

Une pull request par sujet est plus facile à relire qu'une seule grosse pull request. Si vous êtes bloqué, ouvrez quand même la pull request et posez votre question : un brouillon est une bonne façon de demander de l'aide.

Dans le code, les noms de variables, les commentaires et les messages de commit restent en anglais.

### Où se trouvent les choses

| Dossier | Contenu |
| --- | --- |
| `app/` | Les écrans (Expo Router : un fichier par écran) |
| `components/` | Les éléments d'interface réutilisables |
| `data/pictograms/` | Les pictogrammes et leurs phrases, un fichier JSON par catégorie |
| `assets/pictos/` | Les images des pictogrammes (`.webp`), un dossier par catégorie |
| `locales/` | Les textes des menus de l'application, en français et en anglais |
| `lib/` | Base de données, synthèse vocale, export et import |
| `scripts/` | Scripts utilitaires pour les images de pictogrammes |

Après avoir ajouté des images dans `assets/pictos/`, lancez `pnpm update-pictos` pour les relier aux fichiers de données.

### Bon à savoir

- L'application doit continuer à fonctionner **hors ligne** et ne doit jamais envoyer les données des utilisateurs où que ce soit.
- Tout texte affiché à l'utilisateur doit exister en français et en anglais.
- Les changements peuvent perturber les utilisateurs : évitez de déplacer ou de renommer ce qu'ils connaissent déjà sans bonne raison.

## Technologies

React Native avec [Expo](https://expo.dev) et TypeScript, Expo Router pour la navigation, SQLite avec Drizzle pour le stockage local, i18next pour les traductions, et la synthèse vocale intégrée au téléphone.

## Licence

Pexy est un logiciel libre, publié sous la [licence publique générale GNU v3.0](LICENSE) (ou toute version ultérieure). Vous pouvez l'utiliser, l'étudier, le modifier et le partager. Si vous distribuez une version modifiée, elle doit rester ouverte, sous la même licence.

Copyright (C) 2026 SLcode777.

Les images des pictogrammes ont été créées par l'autrice pour Pexy et sont partagées sous la même licence. Le nom « Pexy » et la mascotte renard ne sont pas couverts par cette licence : merci de ne pas les utiliser pour une version modifiée de l'application.

## Contact

Une question ou une idée : [ouvrez une issue](https://github.com/SLcode777/pexy/issues).

Merci de contribuer à rendre la communication plus facile 🩵
