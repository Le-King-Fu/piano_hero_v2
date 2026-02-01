/**
 * Classe Note - Représente une note tombante dans le jeu
 */

import { NOTE, NOTES, HIT_ZONE, CANVAS } from '../config.js';
import { isInHitZone, getLaneIndex } from '../utils/helpers.js';

export class Note {
  /**
   * Crée une nouvelle note
   * @param {string} noteType - Type de note (C, D, E, F, G, A, B)
   * @param {boolean} isBonus - Si c'est une note bonus
   */
  constructor(noteType, isBonus = false) {
    this.type = noteType;
    this.lane = getLaneIndex(noteType, NOTES);
    this.isBonus = isBonus;
    this.bonusImageIndex = isBonus ? Math.floor(Math.random() * 100) : 0; // Index pour rotation d'images
    this.hit = false;
    this.missed = false;

    // Position initiale (au-dessus du canvas)
    this.y = -NOTE.HEIGHT;

    // Calcul de la position X basée sur la lane
    const laneWidth = CANVAS.WIDTH / NOTES.length;
    this.x = this.lane * laneWidth + NOTE.PADDING;
    this.width = laneWidth - NOTE.PADDING * 2;
    this.height = NOTE.HEIGHT;

    // Animation
    this.animationFrame = 0;
    this.hitAnimationTimer = 0;
  }

  /**
   * Met à jour la position de la note
   * @param {number} speed - Vitesse de déplacement
   * @param {number} deltaTime - Temps écoulé depuis la dernière frame (ms)
   * @returns {boolean} True si la note est encore visible
   */
  update(speed, deltaTime) {
    // Normaliser deltaTime pour un mouvement fluide (basé sur 60fps)
    const normalizedDelta = deltaTime / 16.67;
    this.y += speed * normalizedDelta;

    // Animation de pulsation pour les bonus
    if (this.isBonus && !this.hit) {
      this.animationFrame += deltaTime * 0.01;
    }

    // Animation de hit
    if (this.hit) {
      this.hitAnimationTimer += deltaTime;
    }

    // Vérifier si la note a dépassé le bas du canvas
    if (this.y > CANVAS.HEIGHT) {
      if (!this.hit) {
        this.missed = true;
      }
      return false; // Note à supprimer
    }

    return true; // Note encore visible
  }

  /**
   * Vérifie si la note est dans la zone de hit
   * @returns {boolean} True si la note peut être frappée
   */
  canBeHit() {
    if (this.hit || this.missed) {
      return false;
    }
    return isInHitZone(this.y, this.height, HIT_ZONE.Y, HIT_ZONE.TOLERANCE);
  }

  /**
   * Marque la note comme frappée
   */
  markAsHit() {
    this.hit = true;
    this.hitAnimationTimer = 0;
  }

  /**
   * Vérifie si l'animation de hit est terminée
   * @returns {boolean} True si l'animation est finie
   */
  isHitAnimationComplete() {
    return this.hit && this.hitAnimationTimer > 200;
  }

  /**
   * Retourne les données de la note pour le rendu
   * @returns {Object} Données de rendu
   */
  getRenderData() {
    // Effet de pulsation pour les bonus
    let scale = 1;
    if (this.isBonus && !this.hit) {
      scale = 1 + Math.sin(this.animationFrame) * 0.1;
    }

    // Effet de disparition pour les notes touchées
    let alpha = 1;
    if (this.hit) {
      alpha = Math.max(0, 1 - this.hitAnimationTimer / 200);
    }

    return {
      x: this.x,
      y: this.y,
      width: this.width * scale,
      height: this.height * scale,
      type: this.type,
      lane: this.lane,
      isBonus: this.isBonus,
      bonusImageIndex: this.bonusImageIndex,
      hit: this.hit,
      missed: this.missed,
      alpha,
      scale
    };
  }

  /**
   * Crée une note aléatoire
   * @param {number} bonusChance - Probabilité d'avoir un bonus (0-1)
   * @returns {Note} Nouvelle note
   */
  static createRandom(bonusChance = 0.15) {
    const randomIndex = Math.floor(Math.random() * NOTES.length);
    const noteType = NOTES[randomIndex];
    const isBonus = Math.random() < bonusChance;
    return new Note(noteType, isBonus);
  }
}
