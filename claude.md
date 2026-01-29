# Héro du Piano - Guide de développement

## Description
Jeu de rythme style cyberpunk/neon où le joueur doit attraper les notes tombantes en appuyant sur les bonnes touches du piano. Inspiré visuellement de witch_case.

## Stack technique
- **Build** : Vite 5.x
- **Tests** : Vitest avec couverture v8
- **Style** : Cyberpunk/neon avec effets de glow
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
│   ├── Renderer.js  # Rendu canvas avec effets neon
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

### Style visuel - Cyberpunk/Neon (inspiré de witch_case)
- Résolution native : 320×240
- Affichage upscalé ×2 : 640×480
- Police : 'Courier New', monospace
- Thème sombre avec accents néon lumineux
- Effets de glow (text-shadow, box-shadow)
- Animations pulse pour les éléments importants

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

## Palette de couleurs - Cyberpunk/Neon

```javascript
COLORS = {
  BG: '#1a1a2e',           // Bleu-noir très foncé (fond principal)
  BG_SECONDARY: '#16213e', // Bleu nuit (fond secondaire)
  BG_DARK: '#0f3460',      // Bleu foncé (accents de fond)
  PRIMARY: '#e94560',      // Rose/rouge néon (éléments principaux, bordures)
  PRIMARY_DARK: '#c73e54', // Rose foncé (ombres des boutons)
  SECONDARY: '#00ff88',    // Vert néon (score, succès, highlights)
  ACCENT: '#ff6b6b',       // Rouge clair (erreurs, miss)
  COIN: '#ffcc00',         // Or/jaune (bonus)
  TEXT: '#888888',         // Gris (texte secondaire)
  WHITE: '#ffffff'         // Blanc pur
}
```

## Effets visuels

### Effets de glow (CSS)
```css
/* Titre avec glow rose */
text-shadow: 0 0 10px #e94560, 0 0 20px #e94560;

/* Score avec glow vert */
text-shadow: 0 0 5px #00ff88;

/* Canvas avec glow */
box-shadow: 0 0 20px rgba(233, 69, 96, 0.3);
```

### Animations
```css
/* Pulse pour bonus et éléments importants */
@keyframes bonusPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

/* Glow pulsant pour le texte */
@keyframes textGlow {
  0%, 100% { text-shadow: 0 0 10px #e94560, 0 0 20px #e94560; }
  50% { text-shadow: 0 0 15px #e94560, 0 0 30px #e94560; }
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
