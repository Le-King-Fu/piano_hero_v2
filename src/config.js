/**
 * Configuration globale du jeu Héro du Piano
 * Contient toutes les constantes : dimensions, couleurs, niveaux, mapping clavier
 */

// Dimensions du canvas (résolution HD)
export const CANVAS = {
  WIDTH: 640,           // Largeur native HD
  HEIGHT: 480,          // Hauteur native HD
  SCALE: 1              // Pas de scaling, résolution native affichée
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
  WIDTH: Math.floor(CANVAS.WIDTH / NOTES.length) - 8,  // Largeur d'une note
  HEIGHT: 40,           // Hauteur d'une note (doublée pour HD)
  PADDING: 4            // Espacement entre les notes et les bords de lane
};

// Zone de hit (où le joueur doit appuyer)
export const HIT_ZONE = {
  Y: CANVAS.HEIGHT - 80,  // Position Y de la zone
  HEIGHT: 48,             // Hauteur de la zone (doublée pour HD)
  TOLERANCE: 30           // Tolérance en pixels (doublée pour HD)
};

// Configuration des niveaux (8 niveaux)
export const LEVELS = [
  { speed: 0.8,  spawnInterval: 1600, name: 'Débutant' },
  { speed: 1.0,  spawnInterval: 1300, name: 'Facile' },
  { speed: 1.3,  spawnInterval: 1000, name: 'Moyen' },
  { speed: 1.6,  spawnInterval: 800,  name: 'Difficile' },
  { speed: 2.0,  spawnInterval: 600,  name: 'Expert' },
  { speed: 2.4,  spawnInterval: 500,  name: 'Maître' },
  { speed: 2.8,  spawnInterval: 400,  name: 'Légende' },
  { speed: 3.2,  spawnInterval: 350,  name: 'Impossible' }
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

// Mélodie de fond - "Souvenirs d'Hiver" (inspirée, avec touche personnelle)
// Une mélodie nostalgique et douce, évoquant des souvenirs chaleureux
export const MELODY = [
  // Phrase 1 - Ouverture douce et montante
  'E', 'G', 'A', 'G',
  'E', 'D', 'C', 'D',
  // Phrase 2 - Écho et variation
  'E', 'G', 'A', 'B',
  'A', 'G', 'E', 'D',
  // Phrase 3 - Moment de réflexion
  'C', 'E', 'G', 'E',
  'F', 'A', 'G', 'F',
  // Phrase 4 - Résolution nostalgique
  'E', 'D', 'C', 'E',
  'D', 'C', 'D', 'C'
];

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

// Configuration Leaderboard (Supabase)
export const LEADERBOARD = {
  ENABLED: false,  // Mettre à true pour activer
  SUPABASE_URL: '', // URL de votre instance Supabase
  SUPABASE_KEY: '', // Clé anonyme Supabase
  TABLE_NAME: 'piano_hero_scores'
};

/*
 * Pour activer le leaderboard :
 * 1. Créer un projet sur https://supabase.com
 * 2. Créer une table 'piano_hero_scores' avec les colonnes :
 *    - id (int8, primary key, auto-increment)
 *    - player_name (text)
 *    - score (int4)
 *    - level (int4)
 *    - created_at (timestamptz, default: now())
 * 3. Configurer les Row Level Security (RLS) policies
 * 4. Copier l'URL et la clé anon dans LEADERBOARD ci-dessus
 * 5. Installer le client : npm install @supabase/supabase-js
 * 6. Mettre ENABLED à true
 */
