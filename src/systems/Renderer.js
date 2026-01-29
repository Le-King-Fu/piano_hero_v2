/**
 * Système de rendu pixel art pour Héro du Piano
 * Gère le canvas avec upscaling et style Game Boy
 */

import { CANVAS, COLORS, NOTES, HIT_ZONE, NOTE_NAMES_FR } from '../config.js';
import { Input } from './Input.js';

export class Renderer {
  /**
   * Crée le renderer
   * @param {HTMLCanvasElement} canvas - Élément canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Configuration du canvas pour le pixel art
    this.setupCanvas();

    // Largeur d'une lane
    this.laneWidth = CANVAS.WIDTH / NOTES.length;

    // Police chargée
    this.fontLoaded = false;
  }

  /**
   * Configure le canvas pour le rendu pixel art
   */
  setupCanvas() {
    // Résolution native
    this.canvas.width = CANVAS.WIDTH;
    this.canvas.height = CANVAS.HEIGHT;

    // Taille affichée (upscale)
    this.canvas.style.width = `${CANVAS.WIDTH * CANVAS.SCALE}px`;
    this.canvas.style.height = `${CANVAS.HEIGHT * CANVAS.SCALE}px`;

    // Désactiver l'anti-aliasing pour un rendu pixel parfait
    this.ctx.imageSmoothingEnabled = false;

    // Style CSS pour le pixel art
    this.canvas.style.imageRendering = 'pixelated';
    this.canvas.style.imageRendering = 'crisp-edges';
  }

  /**
   * Efface le canvas avec la couleur de fond
   */
  clear() {
    this.ctx.fillStyle = COLORS.BG;
    this.ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
  }

  /**
   * Dessine les lignes de séparation des lanes
   */
  drawLanes() {
    this.ctx.strokeStyle = COLORS.DARK;
    this.ctx.lineWidth = 1;

    for (let i = 1; i < NOTES.length; i++) {
      const x = Math.floor(i * this.laneWidth);
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, CANVAS.HEIGHT);
      this.ctx.stroke();
    }
  }

  /**
   * Dessine la zone de hit
   */
  drawHitZone() {
    // Zone de hit (rectangle semi-transparent)
    this.ctx.fillStyle = COLORS.SECONDARY;
    this.ctx.globalAlpha = 0.3;
    this.ctx.fillRect(0, HIT_ZONE.Y, CANVAS.WIDTH, HIT_ZONE.HEIGHT);
    this.ctx.globalAlpha = 1;

    // Ligne de hit
    this.ctx.strokeStyle = COLORS.PRIMARY;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, HIT_ZONE.Y);
    this.ctx.lineTo(CANVAS.WIDTH, HIT_ZONE.Y);
    this.ctx.stroke();

    // Labels des touches
    this.ctx.fillStyle = COLORS.PRIMARY;
    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';

    for (let i = 0; i < NOTES.length; i++) {
      const x = i * this.laneWidth + this.laneWidth / 2;
      const keys = Input.getNoteKeys(NOTES[i]);
      // Afficher la première touche (AZERTY)
      this.ctx.fillText(keys[0], x, HIT_ZONE.Y + HIT_ZONE.HEIGHT - 4);
    }
  }

  /**
   * Dessine une note
   * @param {Object} noteData - Données de rendu de la note
   */
  drawNote(noteData) {
    const { x, y, width, height, type, lane, isBonus, hit, alpha, scale } = noteData;

    this.ctx.globalAlpha = alpha;

    // Position centrée pour l'effet de scale
    const centerX = x + width / 2 / scale;
    const centerY = y + height / 2 / scale;
    const drawX = centerX - width / 2;
    const drawY = centerY - height / 2;

    if (isBonus) {
      // Note bonus (dorée avec effet pulsant)
      this.ctx.fillStyle = hit ? COLORS.SECONDARY : COLORS.COIN;

      // Rectangle principal
      this.ctx.fillRect(Math.floor(drawX), Math.floor(drawY), Math.floor(width), Math.floor(height));

      // Bordure pixelisée
      this.ctx.strokeStyle = COLORS.DARK;
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(Math.floor(drawX), Math.floor(drawY), Math.floor(width), Math.floor(height));

      // Étoile simple au centre (pixel art)
      if (!hit) {
        this.ctx.fillStyle = COLORS.WHITE;
        const starX = Math.floor(centerX);
        const starY = Math.floor(centerY);
        // Petite croix pour représenter une étoile
        this.ctx.fillRect(starX - 1, starY - 3, 2, 6);
        this.ctx.fillRect(starX - 3, starY - 1, 6, 2);
      }
    } else {
      // Note normale (verte)
      this.ctx.fillStyle = hit ? COLORS.DARK : COLORS.PRIMARY;
      this.ctx.fillRect(Math.floor(drawX), Math.floor(drawY), Math.floor(width), Math.floor(height));

      // Bordure
      this.ctx.strokeStyle = COLORS.DARK;
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(Math.floor(drawX), Math.floor(drawY), Math.floor(width), Math.floor(height));

      // Nom de la note
      if (!hit) {
        this.ctx.fillStyle = COLORS.BG;
        this.ctx.font = '6px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(NOTE_NAMES_FR[type], Math.floor(centerX), Math.floor(centerY + 2));
      }
    }

    this.ctx.globalAlpha = 1;
  }

  /**
   * Dessine le piano visuel en bas de l'écran
   * @param {string[]} activeNotes - Notes actuellement pressées
   */
  drawPiano(activeNotes = []) {
    const pianoY = CANVAS.HEIGHT - 24;
    const keyHeight = 20;

    for (let i = 0; i < NOTES.length; i++) {
      const x = i * this.laneWidth;
      const note = NOTES[i];
      const isActive = activeNotes.includes(note);

      // Touche du piano
      this.ctx.fillStyle = isActive ? COLORS.PRIMARY : COLORS.SECONDARY;
      this.ctx.fillRect(Math.floor(x + 2), pianoY, Math.floor(this.laneWidth - 4), keyHeight);

      // Bordure
      this.ctx.strokeStyle = COLORS.DARK;
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(Math.floor(x + 2), pianoY, Math.floor(this.laneWidth - 4), keyHeight);

      // Nom de la note
      this.ctx.fillStyle = isActive ? COLORS.BG : COLORS.DARK;
      this.ctx.font = '6px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(NOTE_NAMES_FR[note], Math.floor(x + this.laneWidth / 2), pianoY + 13);
    }
  }

  /**
   * Dessine l'interface utilisateur (score, niveau)
   * @param {Object} uiData - Données de l'UI
   */
  drawUI(uiData) {
    const { score, highScore, level, levelName } = uiData;

    this.ctx.fillStyle = COLORS.PRIMARY;
    this.ctx.font = '8px "Press Start 2P", monospace';

    // Score en haut à gauche
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`SCORE: ${score}`, 4, 12);

    // High score en haut à droite
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`MAX: ${highScore}`, CANVAS.WIDTH - 4, 12);

    // Niveau au centre
    if (levelName) {
      this.ctx.textAlign = 'center';
      this.ctx.fillText(levelName.toUpperCase(), CANVAS.WIDTH / 2, 12);
    }
  }

  /**
   * Dessine l'écran de menu
   * @param {number} highScore - Meilleur score
   */
  drawMenu(highScore) {
    console.log('[Renderer] Dessin du menu');
    this.clear();

    // Test visuel - rectangle pour vérifier que le canvas fonctionne
    this.ctx.fillStyle = COLORS.PRIMARY;
    this.ctx.fillRect(10, 10, 50, 10);

    // Titre
    this.ctx.fillStyle = COLORS.PRIMARY;
    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('HERO DU', CANVAS.WIDTH / 2, 60);
    this.ctx.fillText('PIANO', CANVAS.WIDTH / 2, 80);

    // Instructions
    this.ctx.font = '6px "Press Start 2P", monospace';
    this.ctx.fillStyle = COLORS.SECONDARY;
    this.ctx.fillText('APPUIE SUR LES TOUCHES', CANVAS.WIDTH / 2, 120);
    this.ctx.fillText('A S D F G H J', CANVAS.WIDTH / 2, 135);

    // High score
    if (highScore > 0) {
      this.ctx.fillStyle = COLORS.COIN;
      this.ctx.fillText(`RECORD: ${highScore}`, CANVAS.WIDTH / 2, 160);
    }

    // Démarrer
    this.ctx.fillStyle = COLORS.PRIMARY;
    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.fillText('CLIQUER POUR', CANVAS.WIDTH / 2, 200);
    this.ctx.fillText('COMMENCER', CANVAS.WIDTH / 2, 215);
  }

  /**
   * Dessine l'écran de pause
   */
  drawPauseOverlay() {
    // Fond semi-transparent
    this.ctx.fillStyle = COLORS.BG;
    this.ctx.globalAlpha = 0.8;
    this.ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
    this.ctx.globalAlpha = 1;

    // Texte
    this.ctx.fillStyle = COLORS.PRIMARY;
    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSE', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2);

    this.ctx.font = '6px "Press Start 2P", monospace';
    this.ctx.fillText('ESPACE POUR REPRENDRE', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 20);
  }

  /**
   * Dessine l'écran de game over
   * @param {number} score - Score final
   * @param {number} highScore - Meilleur score
   * @param {boolean} isNewHighScore - Nouveau record ?
   */
  drawGameOver(score, highScore, isNewHighScore) {
    // Fond semi-transparent
    this.ctx.fillStyle = COLORS.BG;
    this.ctx.globalAlpha = 0.9;
    this.ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
    this.ctx.globalAlpha = 1;

    // Titre
    this.ctx.fillStyle = COLORS.ACCENT;
    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('FIN DE PARTIE', CANVAS.WIDTH / 2, 80);

    // Score
    this.ctx.fillStyle = COLORS.PRIMARY;
    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.fillText(`SCORE: ${score}`, CANVAS.WIDTH / 2, 120);

    // Nouveau record
    if (isNewHighScore) {
      this.ctx.fillStyle = COLORS.COIN;
      this.ctx.fillText('NOUVEAU RECORD!', CANVAS.WIDTH / 2, 145);
    }

    // High score
    this.ctx.fillStyle = COLORS.SECONDARY;
    this.ctx.fillText(`RECORD: ${highScore}`, CANVAS.WIDTH / 2, 170);

    // Rejouer
    this.ctx.fillStyle = COLORS.PRIMARY;
    this.ctx.font = '6px "Press Start 2P", monospace';
    this.ctx.fillText('CLIQUER POUR REJOUER', CANVAS.WIDTH / 2, 210);
  }

  /**
   * Dessine un effet de hit réussi
   * @param {number} lane - Index de la lane
   */
  drawHitEffect(lane) {
    const x = lane * this.laneWidth;

    this.ctx.fillStyle = COLORS.PRIMARY;
    this.ctx.globalAlpha = 0.5;
    this.ctx.fillRect(x, HIT_ZONE.Y - 10, this.laneWidth, HIT_ZONE.HEIGHT + 20);
    this.ctx.globalAlpha = 1;
  }

  /**
   * Dessine un effet de note ratée
   * @param {number} lane - Index de la lane
   */
  drawMissEffect(lane) {
    const x = lane * this.laneWidth;

    this.ctx.fillStyle = COLORS.ACCENT;
    this.ctx.globalAlpha = 0.5;
    this.ctx.fillRect(x, HIT_ZONE.Y - 10, this.laneWidth, HIT_ZONE.HEIGHT + 20);
    this.ctx.globalAlpha = 1;
  }
}
