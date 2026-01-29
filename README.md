# Héro du Piano

Jeu de rythme rétro style Game Boy. Attrapez les notes qui tombent en appuyant sur les bonnes touches !

## Aperçu

- Style pixel art avec palette de couleurs Game Boy
- Sons 8-bit générés avec Web Audio API
- 5 niveaux de difficulté
- Notes bonus pour des points supplémentaires
- Compatible clavier et tactile (mobile)

## Installation

```bash
npm install
```

## Commandes

```bash
# Serveur de développement
npm run dev

# Build production
npm run build

# Tests
npm test

# Tests avec couverture
npm run test:coverage
```

## Contrôles

| Touche | Note |
|--------|------|
| A | Do |
| S | Ré |
| D | Mi |
| F | Fa |
| G | Sol |
| H | La |
| J | Si |

- **Espace** : Pause/Reprendre
- **Échap** : Retour au menu

## Architecture

```
src/
├── main.js          # Point d'entrée
├── game.js          # Boucle de jeu
├── config.js        # Configuration
├── entities/
│   └── Note.js      # Entité note
├── systems/
│   ├── Input.js     # Clavier/tactile
│   ├── Renderer.js  # Rendu canvas
│   └── Audio.js     # Sons 8-bit
└── utils/
    └── helpers.js   # Utilitaires
```

## Licence

MIT
