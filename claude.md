# Héro du Piano - Guide de développement

## Description
Jeu de rythme style cyberpunk/neon où le joueur doit attraper les notes tombantes en appuyant sur les bonnes touches du clavier. Le joueur dispose de 5 vies et la difficulté augmente automatiquement tous les 1500 points.

## Stack technique
- **Build** : Vite 5.x
- **Tests** : Vitest avec couverture v8
- **Style** : Cyberpunk/neon avec effets de glow (inspiré de witch_case)
- **Audio** : Web Audio API (ondes carrées 8-bit)

## Architecture

```
src/
├── main.js          # Point d'entrée, initialisation, callbacks UI
├── game.js          # Boucle de jeu, états, vies, level up
├── config.js        # Constantes globales (couleurs, niveaux, touches, vies)
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

### Style visuel - Cyberpunk/Neon Orange
- Résolution native : 320×240
- Affichage upscalé ×2 : 640×480
- Police : 'Courier New', monospace
- Thème sombre avec accents néon orange et vert
- Effets de glow (text-shadow, box-shadow)
- Animations pulse pour les éléments importants
- **Emphase sur les touches clavier** (A, S, D, F, G, H, J) plutôt que les notes musicales

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

## Palette de couleurs - Cyberpunk/Neon Orange

```javascript
COLORS = {
  BG: '#1a1a2e',           // Bleu-noir très foncé (fond principal)
  BG_SECONDARY: '#16213e', // Bleu nuit (fond secondaire)
  BG_DARK: '#0f3460',      // Bleu foncé (accents de fond)
  PRIMARY: '#ff6b35',      // Orange néon (éléments principaux, bordures)
  PRIMARY_DARK: '#e55a2b', // Orange foncé (ombres des boutons)
  SECONDARY: '#00ff88',    // Vert néon (score, succès, highlights)
  ACCENT: '#ff6b6b',       // Rouge clair (erreurs, vies)
  COIN: '#ffcc00',         // Or/jaune (bonus)
  TEXT: '#888888',         // Gris (texte secondaire)
  WHITE: '#ffffff'         // Blanc pur
}
```

## Gameplay

### Système de vies
- **5 vies** au départ
- **-1 vie** à chaque touche erronée (appui sans note correspondante)
- Game over quand vies = 0
- Affichage : coeurs (♥♥♥♥♥)

### Difficulté croissante (Level Up)
- Tous les **1500 points**, le niveau augmente automatiquement
- Message **"LEVEL UP!"** affiché pendant 1 seconde
- 5 niveaux de difficulté : Débutant → Facile → Moyen → Difficile → Expert
- Vitesse et fréquence des notes augmentent à chaque niveau

### Niveaux
| Niveau    | Vitesse | Intervalle spawn |
|-----------|---------|------------------|
| Débutant  | 0.8     | 1600ms           |
| Facile    | 1.0     | 1300ms           |
| Moyen     | 1.3     | 1000ms           |
| Difficile | 1.6     | 800ms            |
| Expert    | 2.0     | 600ms            |

## Mapping clavier

| Touche | Note interne |
|--------|--------------|
| A      | C (Do)       |
| S      | D (Ré)       |
| D      | E (Mi)       |
| F      | F (Fa)       |
| G      | G (Sol)      |
| H      | A (La)       |
| J      | B (Si)       |

**Note** : L'affichage met l'emphase sur les touches (A, S, D, F, G, H, J) plutôt que sur les noms de notes musicales.

## Effets visuels

### Effets de glow (CSS)
```css
/* Titre et éléments principaux avec glow orange */
text-shadow: 0 0 10px #ff6b35, 0 0 20px #ff6b35;

/* Score avec glow vert */
text-shadow: 0 0 5px #00ff88;

/* Canvas avec glow */
box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
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
  0%, 100% { text-shadow: 0 0 10px #ff6b35, 0 0 20px #ff6b35; }
  50% { text-shadow: 0 0 15px #ff6b35, 0 0 30px #ff6b35; }
}
```

## Configuration

```javascript
// Vies
LIVES = {
  INITIAL: 5,    // Vies au départ
  MAX: 5         // Maximum de vies
}

// Level Up automatique
LEVEL_UP = {
  SCORE_THRESHOLD: 1500,  // Points pour level up
  DISPLAY_DURATION: 1000  // Durée affichage "LEVEL UP!" (ms)
}
```
