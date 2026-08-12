# Gestion Tribu de Joseph

Application React + Vite pour la gestion de la Tribu de Joseph.

## Fonctionnalités
- Tableau de bord
- Membres
- Événements
- Prière 24
- Familles GEM
- Visites
- Agenda
- Paramètres
- Sauvegarde locale avec `localStorage`

## Installation locale

```bash
npm install
npm run dev
```

Puis ouvrir l'adresse indiquée par Vite, généralement `http://localhost:5173`.

## Production

```bash
npm run build
npm run preview
```

Le dossier généré est `dist/`.

## Déploiement Vercel

Importer le dépôt GitHub dans Vercel. Vercel doit détecter Vite automatiquement.

- Build command: `npm run build`
- Output directory: `dist`

Un `vercel.json` est inclus pour gérer les routes SPA.

## Important

Cette version utilise `localStorage`. Les données sont donc propres au navigateur/appareil utilisé. Pour une utilisation multi-utilisateurs avec les mêmes données, il faudra ensuite connecter une base de données en ligne (par exemple Firebase/Supabase).
