/**
 * Configuration globale du jeu Héro du Piano
 * Contient toutes les constantes : dimensions, couleurs, niveaux, mapping clavier
 */

// Dimensions du canvas (résolution native Game Boy style)
export const CANVAS = {
  WIDTH: 320,           // Largeur native
  HEIGHT: 240,          // Hauteur native
  SCALE: 2              // Facteur d'échelle pour l'affichage
};

// Palette de couleurs Cyberpunk/Neon - Orange (inspiré de witch_case)
export const COLORS = {
  BG: '#1a1a2e',           // Bleu-noir très foncé (fond principal)
  BG_SECONDARY: '#16213e', // Bleu nuit (fond secondaire)
  BG_DARK: '#0f3460',      // Bleu foncé (accents de fond)
  PRIMARY: '#ff6b35',      // Orange néon (éléments principaux)
  PRIMARY_DARK: '#e55a2b', // Orange foncé (ombres)
  SECONDARY: '#00ff88',    // Vert néon (score, succès)
  DARK: '#0f3460',         // Bleu foncé (séparateurs)
  ACCENT: '#ff6b6b',       // Rouge clair (erreurs/miss)
  COIN: '#ffcc00',         // Or/jaune (bonus)
  WHITE: '#ffffff'         // Blanc pur pour textes
};

// Configuration des notes
export const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Noms français des notes (pour l'affichage)
export const NOTE_NAMES_FR = {
  'C': 'Do',
  'D': 'Ré',
  'E': 'Mi',
  'F': 'Fa',
  'G': 'Sol',
  'A': 'La',
  'B': 'Si'
};

// Mapping note -> touche clavier (pour l'affichage)
export const NOTE_TO_KEY = {
  'C': 'A',
  'D': 'S',
  'E': 'D',
  'F': 'F',
  'G': 'G',
  'A': 'H',
  'B': 'J'
};

// Dimensions des notes
export const NOTE = {
  WIDTH: Math.floor(CANVAS.WIDTH / NOTES.length) - 4,  // Largeur d'une note
  HEIGHT: 20,           // Hauteur d'une note
  PADDING: 2            // Espacement entre les notes et les bords de lane
};

// Zone de hit (où le joueur doit appuyer)
export const HIT_ZONE = {
  Y: CANVAS.HEIGHT - 40,  // Position Y de la zone
  HEIGHT: 24,             // Hauteur de la zone
  TOLERANCE: 15           // Tolérance en pixels (avant/après)
};

// Configuration des niveaux
export const LEVELS = [
  { speed: 0.8,  spawnInterval: 1600, name: 'Débutant' },
  { speed: 1.0,  spawnInterval: 1300, name: 'Facile' },
  { speed: 1.3,  spawnInterval: 1000, name: 'Moyen' },
  { speed: 1.6,  spawnInterval: 800,  name: 'Difficile' },
  { speed: 2.0,  spawnInterval: 600,  name: 'Expert' }
];

// Mapping clavier -> note
export const KEY_MAP = {
  'a': 'C',
  's': 'D',
  'd': 'E',
  'f': 'F',
  'g': 'G',
  'h': 'A',
  'j': 'B',
  // Support QWERTY aussi
  'q': 'C',
  'w': 'D',
  'e': 'E',
  'r': 'F',
  't': 'G',
  'y': 'A',
  'u': 'B'
};

// Fréquences des notes (Hz) pour l'audio
export const NOTE_FREQ = {
  'C': 261.63,
  'D': 293.66,
  'E': 329.63,
  'F': 349.23,
  'G': 392.00,
  'A': 440.00,
  'B': 493.88
};

// Mélodie de fond (séquence de notes)
export const MELODY = ['C', 'E', 'G', 'E', 'C', 'E', 'G', 'A', 'G', 'E', 'D', 'E', 'F', 'E', 'D', 'C'];

// Configuration des bonus
export const BONUS = {
  CHANCE: 0.15,         // 15% de chance d'avoir un bonus
  MULTIPLIER: 3         // Multiplicateur de score
};

// Points
export const SCORE = {
  HIT: 100,             // Points pour une note normale
  BONUS_HIT: 300,       // Points pour un bonus (100 * 3)
  MISS_PENALTY: 0       // Pas de pénalité pour l'instant
};

// Configuration des vies
export const LIVES = {
  INITIAL: 5,           // Nombre de vies au départ
  MAX: 5                // Nombre maximum de vies
};

// Configuration du level up automatique
export const LEVEL_UP = {
  SCORE_THRESHOLD: 1500,  // Points nécessaires pour level up
  DISPLAY_DURATION: 1000  // Durée d'affichage du "LEVEL UP" en ms
};

// États du jeu
export const GAME_STATE = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameover'
};
