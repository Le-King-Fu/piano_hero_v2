/**
 * Système de rendu pixel art pour Héro du Piano
 * Gère le canvas avec upscaling et style Game Boy
 */

import { CANVAS, COLORS, NOTES, HIT_ZONE, NOTE_TO_KEY } from '../config.js';
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

    // Charger les images bonus (rotation)
    this.bonusImages = [];
    this.bonusImagesLoaded = 0;
    this.loadBonusImages();
  }

  /**
   * Charge toutes les images bonus disponibles
   */
  loadBonusImages() {
    // Liste des images bonus à charger
    const bonusImageFiles = [
      'bonus_piano.png',  // Image originale
      'src/entities/bonus_pic/extracted_face_1.png',
      'src/entities/bonus_pic/extracted_face_2.png',
      'src/entities/bonus_pic/extracted_face_k1.png',
      'src/entities/bonus_pic/extracted_face_k2.png',
      'src/entities/bonus_pic/extracted_face_k3.png'
    ];

    bonusImageFiles.forEach((filename, index) => {
      const img = new Image();
      img.src = filename;
      img.onload = () => {
        this.bonusImagesLoaded++;
      };
      img.onerror = () => {
        // Image non trouvée, on l'ignore silencieusement
      };
      this.bonusImages.push(img);
    });
  }

  /**
   * Retourne une image bonus aléatoire parmi celles chargées
   * @returns {HTMLImageElement|null}
   */
  getRandomBonusImage() {
    const loadedImages = this.bonusImages.filter(img => img.complete && img.naturalWidth > 0);
    if (loadedImages.length === 0) return null;
    return loadedImages[Math.floor(Math.random() * loadedImages.length)];
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
    this.ctx.lineWidth = 2;

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
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(0, HIT_ZONE.Y);
    this.ctx.lineTo(CANVAS.WIDTH, HIT_ZONE.Y);
    this.ctx.stroke();

    // Labels des touches
    this.ctx.fillStyle = COLORS.PRIMARY;
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';

    for (let i = 0; i < NOTES.length; i++) {
      const x = i * this.laneWidth + this.laneWidth / 2;
      const keys = Input.getNoteKeys(NOTES[i]);
      // Afficher la première touche (AZERTY)
      this.ctx.fillText(keys[0], x, HIT_ZONE.Y + HIT_ZONE.HEIGHT - 8);
    }
  }

  /**
   * Dessine une note
   * @param {Object} noteData - Données de rendu de la note
   */
  drawNote(noteData) {
    const { x, y, width, height, type, lane, isBonus, bonusImageIndex, hit, alpha, scale } = noteData;

    this.ctx.globalAlpha = alpha;

    // Position centrée pour l'effet de scale
    const centerX = x + width / 2 / scale;
    const centerY = y + height / 2 / scale;
    const drawX = centerX - width / 2;
    const drawY = centerY - height / 2;

    if (isBonus) {
      // Note bonus avec image (rotation parmi les images disponibles)
      const loadedImages = this.bonusImages.filter(img => img.complete && img.naturalWidth > 0);
      const bonusImage = loadedImages.length > 0
        ? loadedImages[bonusImageIndex % loadedImages.length]
        : null;

      if (bonusImage && !hit) {
        // Dessiner l'image bonus - taille plus grande pour voir le visage
        const imgSize = width + 16; // Taille augmentée pour HD
        const imgX = Math.floor(centerX - imgSize / 2);
        const imgY = Math.floor(centerY - imgSize / 2);
        this.ctx.drawImage(bonusImage, imgX, imgY, imgSize, imgSize);
      } else {
        // Fallback : rectangle doré
        this.ctx.fillStyle = hit ? COLORS.SECONDARY : COLORS.COIN;
        this.ctx.fillRect(Math.floor(drawX), Math.floor(drawY), Math.floor(width), Math.floor(height));

        // Bordure
        this.ctx.strokeStyle = COLORS.DARK;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(Math.floor(drawX), Math.floor(drawY), Math.floor(width), Math.floor(height));
      }
    } else {
      // Note normale (verte)
      this.ctx.fillStyle = hit ? COLORS.DARK : COLORS.PRIMARY;
      this.ctx.fillRect(Math.floor(drawX), Math.floor(drawY), Math.floor(width), Math.floor(height));

      // Bordure
      this.ctx.strokeStyle = COLORS.DARK;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(Math.floor(drawX), Math.floor(drawY), Math.floor(width), Math.floor(height));

      // Nom de la note
      if (!hit) {
        this.ctx.fillStyle = COLORS.BG;
        this.ctx.font = '12px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(NOTE_TO_KEY[type], Math.floor(centerX), Math.floor(centerY + 4));
      }
    }

    this.ctx.globalAlpha = 1;
  }

  /**
   * Dessine le piano visuel en bas de l'écran
   * @param {string[]} activeNotes - Notes actuellement pressées
   */
  drawPiano(activeNotes = []) {
    const pianoY = CANVAS.HEIGHT - 48;
    const keyHeight = 40;

    for (let i = 0; i < NOTES.length; i++) {
      const x = i * this.laneWidth;
      const note = NOTES[i];
      const isActive = activeNotes.includes(note);

      // Touche du piano
      this.ctx.fillStyle = isActive ? COLORS.PRIMARY : COLORS.SECONDARY;
      this.ctx.fillRect(Math.floor(x + 4), pianoY, Math.floor(this.laneWidth - 8), keyHeight);

      // Bordure
      this.ctx.strokeStyle = COLORS.DARK;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(Math.floor(x + 4), pianoY, Math.floor(this.laneWidth - 8), keyHeight);

      // Nom de la note
      this.ctx.fillStyle = isActive ? COLORS.BG : COLORS.DARK;
      this.ctx.font = '12px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(NOTE_TO_KEY[note], Math.floor(x + this.laneWidth / 2), pianoY + 26);
    }
  }

  /**
   * Dessine l'interface utilisateur (score, niveau, vies)
   * @param {Object} uiData - Données de l'UI
   */
  drawUI(uiData) {
    const { score, highScore, level, levelName, lives, maxLives } = uiData;

    this.ctx.fillStyle = COLORS.PRIMARY;
    this.ctx.font = '16px "Press Start 2P", monospace';

    // Score en haut à gauche
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`SCORE: ${score}`, 8, 24);

    // High score en haut à droite
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`MAX: ${highScore}`, CANVAS.WIDTH - 8, 24);

    // Niveau au centre
    if (levelName) {
      this.ctx.textAlign = 'center';
      this.ctx.fillText(levelName.toUpperCase(), CANVAS.WIDTH / 2, 24);
    }

    // Vies en dessous du score (coeurs)
    if (lives !== undefined) {
      this.ctx.textAlign = 'left';
      this.ctx.font = '12px "Press Start 2P", monospace';
      let livesDisplay = '';
      for (let i = 0; i < maxLives; i++) {
        livesDisplay += i < lives ? '♥' : '♡';
      }
      this.ctx.fillStyle = lives > 1 ? COLORS.ACCENT : COLORS.ACCENT;
      this.ctx.fillText(livesDisplay, 8, 44);
    }
  }

  /**
   * Dessine l'affichage "GAME OVER" temporaire
   */
  drawGameOverText() {
    // Fond semi-transparent
    this.ctx.fillStyle = COLORS.BG;
    this.ctx.globalAlpha = 0.7;
    this.ctx.fillRect(CANVAS.WIDTH / 2 - 140, CANVAS.HEIGHT / 2 - 40, 280, 80);
    this.ctx.globalAlpha = 1;

    // Bordure
    this.ctx.strokeStyle = COLORS.ACCENT;
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(CANVAS.WIDTH / 2 - 140, CANVAS.HEIGHT / 2 - 40, 280, 80);

    // Texte "GAME OVER"
    this.ctx.fillStyle = COLORS.ACCENT;
    this.ctx.font = '20px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 8);
  }

  /**
   * Dessine l'affichage "LEVEL UP!"
   */
  drawLevelUp() {
    // Fond semi-transparent
    this.ctx.fillStyle = COLORS.BG;
    this.ctx.globalAlpha = 0.6;
    this.ctx.fillRect(CANVAS.WIDTH / 2 - 120, CANVAS.HEIGHT / 2 - 40, 240, 80);
    this.ctx.globalAlpha = 1;

    // Bordure
    this.ctx.strokeStyle = COLORS.SECONDARY;
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(CANVAS.WIDTH / 2 - 120, CANVAS.HEIGHT / 2 - 40, 240, 80);

    // Texte "LEVEL UP!"
    this.ctx.fillStyle = COLORS.SECONDARY;
    this.ctx.font = '20px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('LEVEL UP!', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 8);
  }

  /**
   * Dessine l'écran de menu
   * @param {number} highScore - Meilleur score
   */
  drawMenu(highScore) {
    console.log('[Renderer] Dessin du menu');
    this.clear();

    // Titre
    this.ctx.fillStyle = COLORS.PRIMARY;
    this.ctx.font = '24px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('HERO DU', CANVAS.WIDTH / 2, 120);
    this.ctx.fillText('PIANO', CANVAS.WIDTH / 2, 160);

    // Instructions
    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.fillStyle = COLORS.SECONDARY;
    this.ctx.fillText('APPUIE SUR LES TOUCHES', CANVAS.WIDTH / 2, 240);
    this.ctx.fillText('A S D F G H J', CANVAS.WIDTH / 2, 270);

    // High score
    if (highScore > 0) {
      this.ctx.fillStyle = COLORS.COIN;
      this.ctx.fillText(`RECORD: ${highScore}`, CANVAS.WIDTH / 2, 320);
    }

    // Démarrer
    this.ctx.fillStyle = COLORS.PRIMARY;
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.fillText('CLIQUER POUR', CANVAS.WIDTH / 2, 400);
    this.ctx.fillText('COMMENCER', CANVAS.WIDTH / 2, 430);
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
    this.ctx.font = '24px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSE', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2);

    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.fillText('ESPACE POUR REPRENDRE', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 40);
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
    this.ctx.font = '20px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('FIN DE PARTIE', CANVAS.WIDTH / 2, 160);

    // Score
    this.ctx.fillStyle = COLORS.PRIMARY;
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.fillText(`SCORE: ${score}`, CANVAS.WIDTH / 2, 240);

    // Nouveau record
    if (isNewHighScore) {
      this.ctx.fillStyle = COLORS.COIN;
      this.ctx.fillText('NOUVEAU RECORD!', CANVAS.WIDTH / 2, 290);
    }

    // High score
    this.ctx.fillStyle = COLORS.SECONDARY;
    this.ctx.fillText(`RECORD: ${highScore}`, CANVAS.WIDTH / 2, 340);

    // Rejouer
    this.ctx.fillStyle = COLORS.PRIMARY;
    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.fillText('CLIQUER POUR REJOUER', CANVAS.WIDTH / 2, 420);
  }

  /**
   * Dessine un effet de hit réussi
   * @param {number} lane - Index de la lane
   */
  drawHitEffect(lane) {
    const x = lane * this.laneWidth;

    this.ctx.fillStyle = COLORS.PRIMARY;
    this.ctx.globalAlpha = 0.5;
    this.ctx.fillRect(x, HIT_ZONE.Y - 20, this.laneWidth, HIT_ZONE.HEIGHT + 40);
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
    this.ctx.fillRect(x, HIT_ZONE.Y - 20, this.laneWidth, HIT_ZONE.HEIGHT + 40);
    this.ctx.globalAlpha = 1;
  }
}
