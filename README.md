# 🍁 Français pour Laura

Site statique d'apprentissage du français pour Laura — interface en espagnol / catalan (toggle), contenu culturel québécois.

## Structure

```
french-pour-laura/
├── index.html              ← Page d'accueil avec toggle ES/CA
├── data/
│   ├── vocabulaire.json    ← Thèmes: nature QC, culture QC, expressions québécoises
│   ├── conjugaison.json    ← Guide des temps + exercices (présent, p.composé, imparfait, futur)
│   ├── grammaire.json      ← Articles, négation, adjectifs avec exemples québécois
│   └── poemes.json         ← Nelligan (Vaisseau d'Or), Vigneault (Gens du pays, Mon pays), Baudelaire (Une Charogne)
├── pages/
│   ├── vocabulaire.html    ← Flashcards + liste
│   ├── conjugaison.html    ← Guide + quiz
│   ├── grammaire.html      ← Explication + quiz
│   └── poemes.html         ← Texte + analyse + vocab + questions
├── css/
│   └── style.css           ← Design sombre, typographie Cormorant Garamond + Outfit
└── js/
    └── lang.js             ← Système ES/CA (localStorage)
```

## Déploiement

### GitHub Pages
1. Push sur GitHub
2. Settings → Pages → Deploy from branch (main, root)
3. URL: `https://[user].github.io/french-pour-laura/`

### Vercel / Netlify
Drag & drop le dossier — aucune configuration nécessaire.

## Ajouter du contenu

Tout le contenu est dans les fichiers JSON de `/data/`. Chaque objet suit le même pattern bilingue `{ "es": "...", "ca": "..." }`.

## Design

- Thème sombre inspiré des nuits québécoises d'hiver
- Typographie: Cormorant Garamond (titres) + Outfit (texte)
- Couleurs: rouge érable (#c8451a) + or (#c9993a) sur fond noir chaud
- Mobile-first avec nav mobile fixe
