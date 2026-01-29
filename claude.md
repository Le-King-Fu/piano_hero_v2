# Héro du Piano - Guide de développement

## Description
Jeu de rythme rétro style Game Boy où le joueur doit attraper les notes tombantes en appuyant sur les bonnes touches du piano.

## Stack technique
- **Build** : Vite 5.x
- **Tests** : Vitest avec couverture v8
- **Style** : Pixel art palette Game Boy
- **Audio** : Web Audio API (ondes carrées 8-bit)

## Architecture

```
src/
├── main.js          # Point d'entrée, initialisation
├── game.js          # Boucle de jeu principale, états
├── config.js        # Constantes globales (couleurs, niveaux, touches)
│
├── entities/
│   └── Note.js      # Entité note tombante
│
├── systems/
│   ├── Input.js     # Gestion clavier et tactile
│   ├── Renderer.js  # Rendu canvas pixelisé
│   └── Audio.js     # Sons 8-bit
│
└── utils/
    └── helpers.js   # Fonctions utilitaires
```

## Conventions

### Code
- Commentaires en français
- Classes ES6 avec modules
- Noms de variables explicites en anglais
- JSDoc pour les fonctions publiques

### Style visuel
- Résolution native : 320×240
- Affichage upscalé ×2 : 640×480
- Palette Game Boy (4 nuances de vert + accents)
- Police : "Press Start 2P"
- Pas d'anti-aliasing (`image-rendering: pixelated`)

### Tests
- Fichiers `*.test.js` dans `tests/`
- Couverture minimum : 70%
- Exécution : `npm test`

## Commandes

```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm test             # Lance les tests
npm run test:coverage # Tests avec couverture
```

## Palette de couleurs

```javascript
COLORS = {
  BG: '#0f380f',        // Vert très foncé (fond)
  PRIMARY: '#9bbc0f',   // Vert clair (éléments principaux)
  SECONDARY: '#8bac0f', // Vert moyen
  DARK: '#306230',      // Vert foncé
  ACCENT: '#ff6b6b',    // Rouge (erreurs)
  COIN: '#ffd700'       // Or (bonus)
}
```

## Mapping clavier

| Touche | Note |
|--------|------|
| A      | Do   |
| S      | Ré   |
| D      | Mi   |
| F      | Fa   |
| G      | Sol  |
| H      | La   |
| J      | Si   |
