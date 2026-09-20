<p align="center">
  <img src="assets/images/no-bg-Pexy-mascot.webp" alt="Pexy, the little white fox mascot" width="160">
</p>

<h1 align="center">Pexy</h1>

<p align="center">
  <strong>English</strong> · <a href="README.fr.md">Français</a>
</p>

Pexy is a free communication app (AAC: Augmentative and Alternative Communication) for people who have trouble speaking: autistic children and adults, people with aphasia or language disorders, and the parents, educators and speech therapists who support them.

The user taps a pictogram, picks a ready-made sentence, and the phone says it out loud.

**[Get Pexy on Google Play](https://play.google.com/store/apps/details?id=com.lucysann.pexy)**

## What it does

- Around 30 categories of pictograms (food, feelings, animals, school, medical...)
- Several sentences per pictogram, read aloud by the phone's voice
- French and English
- Favorites, search, and hidden categories to keep the grid simple
- Custom pictograms from your own photos, and custom sentences
- Export and import of your data
- Works fully offline. No account, no ads, nothing leaves the device.

## Contributing

Contributions are very welcome, whatever your level. You do not need to be a developer to help.

Issues and pull requests can be written in **English or French**.

### Ways to help without writing code

- **Tell us what works and what doesn't.** If you use Pexy with a child, a student or a patient, your feedback is the most valuable thing you can give. [Open an issue](https://github.com/SLcode777/pexy/issues/new) and describe what happened or what is missing.
- **Fix a translation** in the app's menus: [`locales/fr/translation.json`](locales/fr/translation.json) and [`locales/en/translation.json`](locales/en/translation.json).

A translation fix can be done directly on GitHub: open the file, click the pencil icon, make your change, and GitHub will guide you to create a pull request.

### About the sentences

The sentences of each pictogram (in [`data/pictograms/`](data/pictograms)) are written and maintained by the author, so please **do not edit them in a pull request**. If you think a sentence is missing or could be better, [open an issue](https://github.com/SLcode777/pexy/issues/new) to suggest it. These are the principles they follow:

1. **A sentence must be useful in a conversation**: asking for something ("Can I have an apple?"), saying what you want or like ("I like apples."), offering ("Do you want an apple?"), asking a question, or warning ("Be careful, it's hot!"). Avoid sentences that only describe a picture ("The apple is red.").
2. **Never delete an existing sentence.** Many users know their sentences by heart and rely on them. Add new sentences instead. If an old sentence is less useful, move it to the end of the list.
3. **Keep French and English in mirror**: same number of sentences, in the same order, with the same emoji.
4. **French** uses "tu", and a space before `?` and `!` ("Aimes-tu les pommes ?"). **English** has no space before them.
5. Keep sentences short and simple.

### Run the app on your computer

You need [Node.js](https://nodejs.org) (version 20 or newer), [pnpm](https://pnpm.io/installation) and a phone.

```bash
git clone https://github.com/SLcode777/pexy.git
cd pexy
pnpm install
pnpm start
```

Then install **Expo Go** on your phone and scan the QR code shown in the terminal. Your phone and your computer must be on the same Wi-Fi network.

> Pexy currently uses **Expo SDK 54**. The Expo Go app from the store may be more recent and refuse to open the project. In that case, install the [Expo Go version for SDK 54](https://expo.dev/go), or connect an Android phone by USB, press `a` in the terminal and accept when Expo offers to install the right version.

### Propose a change

1. Pick an [open issue](https://github.com/SLcode777/pexy/issues), or open a new one to discuss your idea first. Leave a comment to say you are working on it.
2. [Fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) the repository and create a branch for your change.
3. Make your change and check that the app still runs. Run `pnpm lint` if you touched the code.
4. Open a pull request to `master`. Explain what you changed and why, and add a screenshot if it changes what the user sees.

One pull request per topic is easier to review than one big pull request. If you are stuck, open the pull request anyway and ask: a draft is a fine way to get help.

In the code, variable names, comments and commit messages stay in English.

### Where things are

| Folder | Content |
| --- | --- |
| `app/` | Screens (Expo Router: one file per screen) |
| `components/` | Reusable interface pieces |
| `data/pictograms/` | Pictograms and their sentences, one JSON file per category |
| `assets/pictos/` | Pictogram images (`.webp`), one folder per category |
| `locales/` | Texts of the app's menus, in French and English |
| `lib/` | Database, text-to-speech, export and import |
| `scripts/` | Helper scripts for pictogram images |

After adding pictogram images in `assets/pictos/`, run `pnpm update-pictos` to link them to the data files.

### Good to know

- The app must keep working **offline** and must never send user data anywhere.
- Every text shown to the user needs a French and an English version.
- Users can be disturbed by change: avoid moving or renaming things they already know without a good reason.

## Tech stack

React Native with [Expo](https://expo.dev) and TypeScript, Expo Router for navigation, SQLite with Drizzle for local storage, i18next for translations, and the phone's built-in text-to-speech.

## License

Pexy is free software, released under the [GNU General Public License v3.0](LICENSE) (or any later version). You can use, study, modify and share it. If you distribute a modified version, it must stay open under the same license.

Copyright (C) 2026 SLcode777.

The pictogram images were created by the author for Pexy and are shared under the same license. The name "Pexy" and the fox mascot are not covered by this license: please do not use them for a modified version of the app.

## Contact

Questions or ideas: [open an issue](https://github.com/SLcode777/pexy/issues). 

Thank you for helping make communication easier 🩵
