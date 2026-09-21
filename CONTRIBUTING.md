# Contributing to Pexy, step by step

**English** · [Français](CONTRIBUTING.fr.md)

Thank you for wanting to help! This guide is written for people who are new to contributing on GitHub. If a step is unclear, [open an issue](https://github.com/SLcode777/pexy/issues/new) and ask: questions are welcome, in English or in French.

For what the app is and the rules of the project, read the [README](README.md) first.

## Fork or clone? Both.

- **Fork** = your own copy of the project, *on GitHub*, under your account. You need it because you cannot write directly to the original repository.
- **Clone** = a copy of a repository *on your computer*, so you can work on it.

So the path is: fork Pexy on GitHub, clone **your fork** on your computer, work, send your work to your fork, then ask for it to be added to Pexy with a **pull request**.

```
SLcode777/pexy  ──fork──▶  your-name/pexy  ──clone──▶  your computer
      ▲                          ▲                          │
      └─────pull request─────────┴──────────push────────────┘
```

## One-time setup

1. Install [Git](https://git-scm.com/downloads), [Node.js](https://nodejs.org) (version 22 or newer) and [pnpm](https://pnpm.io/installation).
2. On the [Pexy page](https://github.com/SLcode777/pexy), click **Fork** (top right), then **Create fork**.
3. Clone your fork (replace `your-name` with your GitHub username):

   ```bash
   git clone https://github.com/your-name/pexy.git
   cd pexy
   ```

4. Tell Git where the original project is, so you can get its updates later. We call it `upstream`:

   ```bash
   git remote add upstream https://github.com/SLcode777/pexy.git
   ```

5. Install the project and start it:

   ```bash
   pnpm install
   pnpm start
   ```

   Then open it with **Expo Go** on your phone (see the [README](README.md#run-the-app-on-your-computer), including the note about Expo SDK 54).

## For each contribution

### 1. Choose what to work on

Pick an [open issue](https://github.com/SLcode777/pexy/issues) and leave a comment such as "I'd like to work on this", so nobody does the same work twice. For a new idea, open an issue first so we can discuss it before you spend time on it.

### 2. Start from an up-to-date `master`

```bash
git checkout master
git pull upstream master
```

### 3. Create a branch

One branch per topic. Give it a short name that says what it does:

```bash
git checkout -b fix-search-display
```

Never work directly on `master`: keeping it clean makes step 2 painless next time.

### 4. Make your change

- Keep the change focused on the issue. Small pull requests get reviewed faster.
- Check in the app that it works, and that you did not break what is around it.
- Before committing, run the three checks. They are the same ones GitHub runs on your pull request:

  ```bash
  pnpm test        # checks the pictogram data and the translations
  pnpm typecheck   # checks the TypeScript types
  pnpm lint        # checks the code style
  ```
- Any text the user sees must exist in **both** `locales/fr/translation.json` and `locales/en/translation.json`.
- Please do not edit the sentences in `data/pictograms/` (see the [README](README.md#about-the-sentences)). Suggest them in an issue instead.

### 5. Commit

```bash
git status            # see what changed
git add path/to/file  # choose the files to include
git commit -m "Fix image display in search results"
```

Commit messages are in English, start with a verb, and say what the change does. Several small commits are fine.

### 6. Push to your fork

```bash
git push -u origin fix-search-display
```

### 7. Open the pull request

Go to your fork on GitHub: a yellow banner offers **Compare & pull request**. Click it, then:

- check that the base is `SLcode777/pexy` and `master`;
- give it a clear title;
- explain **what** you changed and **why**, and add a screenshot if the interface changed;
- write `Closes #12` (with the right number) so the issue closes automatically when the pull request is merged.

A few seconds later, GitHub runs the checks automatically: a green tick means they pass, a red cross means one failed. Click **Details** to see which one and why. A red cross is not a problem, it is information: fix, commit, push, and the checks run again.

Not finished, or stuck? Open it as a **draft pull request** and ask your question there.

### 8. Review

You may get comments or requests for changes. That is normal, and it is a conversation, not a judgment. To update your pull request, commit on the same branch and push again: the pull request updates by itself.

### 9. After the merge

```bash
git checkout master
git pull upstream master
git branch -d fix-search-display
```

## When something goes wrong

| Situation | What to do |
| --- | --- |
| "I worked on `master` by mistake" | `git checkout -b my-branch` moves your uncommitted work to a new branch. |
| "GitHub says my branch has conflicts" | `git pull upstream master` on your branch, fix the files marked with `<<<<<<<`, then commit and push. Ask for help in the pull request if needed. |
| "Expo Go refuses to open the project" | See the SDK 54 note in the [README](README.md#run-the-app-on-your-computer). |
| "I committed something I should not have" | Do not panic and do not force anything: say so in the pull request, we will sort it out together. |

Never commit passwords, keys or `.env` files.

## Using an AI assistant

You are welcome to use one. The file [`AGENTS.md`](AGENTS.md) gives coding agents the rules of the project. You stay responsible for what you submit: read the changes, test them in the app, and be ready to explain them.

## Thank you 🩵

Every contribution counts, including a typo fix or a well-described bug.
