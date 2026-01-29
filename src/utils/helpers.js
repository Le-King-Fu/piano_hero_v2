/**
 * Fonctions utilitaires pour Héro du Piano
 */

/**
 * Génère un entier aléatoire entre min et max (inclus)
 * @param {number} min - Valeur minimum
 * @param {number} max - Valeur maximum
 * @returns {number} Entier aléatoire
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Vérifie si deux rectangles se chevauchent
 * @param {Object} rect1 - Premier rectangle {x, y, width, height}
 * @param {Object} rect2 - Second rectangle {x, y, width, height}
 * @returns {boolean} True si collision
 */
export function rectsOverlap(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

/**
 * Limite une valeur entre min et max
 * @param {number} value - Valeur à limiter
 * @param {number} min - Minimum
 * @param {number} max - Maximum
 * @returns {number} Valeur limitée
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Formate un nombre avec séparateur de milliers
 * @param {number} num - Nombre à formater
 * @returns {string} Nombre formaté
 */
export function formatScore(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Calcule l'index de lane pour une note donnée
 * @param {string} note - Note (C, D, E, F, G, A, B)
 * @param {string[]} notes - Tableau des notes
 * @returns {number} Index de la lane (-1 si non trouvé)
 */
export function getLaneIndex(note, notes) {
  return notes.indexOf(note);
}

/**
 * Vérifie si une note est dans la zone de hit
 * @param {number} noteY - Position Y de la note
 * @param {number} noteHeight - Hauteur de la note
 * @param {number} hitZoneY - Position Y de la zone de hit
 * @param {number} tolerance - Tolérance en pixels
 * @returns {boolean} True si la note est dans la zone
 */
export function isInHitZone(noteY, noteHeight, hitZoneY, tolerance) {
  const noteBottom = noteY + noteHeight;
  const zoneTop = hitZoneY - tolerance;
  const zoneBottom = hitZoneY + tolerance + noteHeight;

  return noteBottom >= zoneTop && noteY <= zoneBottom;
}

/**
 * Interpole linéairement entre deux valeurs
 * @param {number} a - Valeur de départ
 * @param {number} b - Valeur d'arrivée
 * @param {number} t - Facteur d'interpolation (0-1)
 * @returns {number} Valeur interpolée
 */
export function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Convertit des millisecondes en format mm:ss
 * @param {number} ms - Millisecondes
 * @returns {string} Format mm:ss
 */
export function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
