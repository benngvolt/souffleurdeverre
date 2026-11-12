# Le Souffleur de Verre — frontend

Application React 18 construite avec [Vite](https://vite.dev) (anciennement Create React App).
Node 20.19+ ou 22.12+ requis.

## Commandes

```bash
npm install
npm run dev       # serveur de développement : http://localhost:3000 (alias : npm start)
npm run build     # build de production dans build/
npm run preview   # sert le dossier build/ en local pour vérification
```

## Variables d'environnement

Copier `.env.example` en `.env.development.local` pour pointer vers un backend local
(`VITE_API_URL`). Sans variable, l'API de production est utilisée.
Les variables exposées au navigateur doivent commencer par `VITE_`.

## Déploiement

1. Déployer le backend en premier (`gcloud app deploy` dans `backend/`).
2. `npm run build`, puis copier le contenu de `build/` (y compris `.htaccess`, fichier caché)
   sur l'hébergement Apache. Le `.htaccess` gère les redirections canoniques et le
   fallback vers `index.html` pour le routeur React.

## Structure

- `index.html` : point d'entrée Vite (à la racine, plus dans `public/`).
- `src/` : code de l'application (les fichiers contenant du JSX ont l'extension `.jsx`).
- `public/` : fichiers copiés tels quels (`assets/`, `.htaccess`, `sitemap.xml`, `robots.txt`...).
- `vite.config.js` : sortie dans `build/`, fichiers générés sous `static/`.
