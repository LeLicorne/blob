# Publier le paquet sur npm (scoped, public)

Référence : https://docs.npmjs.com/creating-and-publishing-scoped-public-packages

Un paquet « scoped » s'appelle `@scope/nom`. Le scope est ton nom d'utilisateur npm ou le nom d'une
organisation npm. Un paquet scoped est **privé par défaut** : il faut `--access public`
(déjà réglé via `publishConfig.access` dans `package.json`).

## 1. Une fois : compte et scope

1. Créer un compte sur https://www.npmjs.com/signup, vérifier l'e-mail, activer la 2FA.
2. Se connecter dans le terminal : `npm login` (vérifier avec `npm whoami`).
3. Choisir le scope : ton nom d'utilisateur (`@ton-user`) ou une organisation créée sur
   https://www.npmjs.com/org/create (gratuite pour les paquets publics).

## 2. Une fois : adapter le projet

- `package.json` : remplacer `@your-scope` dans `name` par ton scope.
- `LICENSE` : remplacer `<your name>`.
- Optionnel mais recommandé : ajouter `author`, `repository`, `bugs` et `homepage` dans
  `package.json` (ils apparaissent sur la page npm). Aucun n'est requis, et rien ne les ajoute
  automatiquement : ce qui est dans `package.json` devient public.
- Dans le README, remplacer `blob-carousel` par `@ton-scope/blob-carousel` dans les imports.

## 3. Vérifier ce qui sera publié

```sh
pnpm install
pnpm qa && pnpm test && pnpm build
npm pack --dry-run      # liste les fichiers : seulement dist/, README, LICENSE, package.json
```

Pour tester en vrai dans un autre projet sans publier : `npm pack` puis, dans l'autre projet,
`npm install /chemin/vers/ton-scope-blob-carousel-0.1.0.tgz`.

## 4. Publier

```sh
npm publish --access public      # prepublishOnly relance qa + tests + build
```

Si la 2FA est activée, npm demande un code. Le paquet est alors sur
`https://www.npmjs.com/package/@ton-scope/blob-carousel`.

Une version publiée ne peut plus être modifiée ni republiée : corriger = incrémenter la version.

## 5. Versions suivantes

```sh
npm version patch     # ou minor / major : met à jour package.json et crée un tag git
npm publish
```

`npm version` crée un commit et un tag **seulement dans un dépôt git** ; sans git, il met juste à
jour `package.json` (ajouter `--no-git-tag-version` pour éviter l'erreur).

## 6. Git (pas encore configuré)

```sh
git init -b main
git add . && git commit -m "feat: blob carousel"
```

`.gitignore` exclut déjà `node_modules`, `dist`, `dist-docs`. Pour publier depuis GitHub Actions
avec provenance, ajouter `repository` dans `package.json` puis `npm publish --provenance`
(workflow avec `permissions: id-token: write`).

## Dépréciation / retrait

- `npm deprecate @ton-scope/blob-carousel@"<0.2.0" "message"`
- `npm unpublish` n'est permis que dans les 72 h suivant la publication (ou sans dépendants).
