/**
 * Classe principale du jeu Héro du Piano
 * Gère la boucle de jeu, les états et la logique principale
 */

import { GAME_STATE, LEVELS, BONUS, SCORE, CANVAS, LIVES, LEVEL_UP } from './config.js';
import { Note } from './entities/Note.js';
import { Input } from './systems/Input.js';
import { Renderer } from './systems/Renderer.js';
import { Audio } from './systems/Audio.js';

export class Game {
  /**
   * Crée une instance du jeu
   * @param {HTMLCanvasElement} canvas - Élément canvas
   */
  constructor(canvas) {
    // Systèmes
    this.renderer = new Renderer(canvas);
    this.input = new Input();
    this.audio = new Audio();

    // État du jeu
    this.state = GAME_STATE.MENU;
    this.currentLevel = 0;

    // Données de jeu
    this.notes = [];
    this.score = 0;
    this.highScore = this._loadHighScore();
    this.lastScore = 0;
    this.lives = LIVES.INITIAL;
    this.startingLevel = 0;

    // Level up automatique
    this.lastLevelUpScore = 0;
    this.levelUpDisplay = null; // { timer: ms } quand actif

    // Timing
    this.lastTime = 0;
    this.lastNoteSpawn = 0;
    this.deltaTime = 0;

    // Effets visuels temporaires
    this.hitEffects = [];
    this.missEffects = [];

    // Callbacks UI
    this.onScoreChange = null;
    this.onStateChange = null;
    this.onLivesChange = null;
    this.onLevelChange = null;

    // Liaison du contexte pour requestAnimationFrame
    this._gameLoop = this._gameLoop.bind(this);
  }

  /**
   * Initialise le jeu
   */
  init() {
    // Initialiser le système d'input
    this.input.init();
    this.input.setOnNotePress((note) => this._handleNotePress(note));

    // Dessiner l'écran de menu
    this.renderer.drawMenu(this.highScore);
  }

  /**
   * Démarre une nouvelle partie
   */
  start() {
    console.log('[Game] Démarrage...');

    // Initialiser l'audio (nécessite une interaction utilisateur)
    this.audio.init();

    // Réinitialiser l'état
    this.notes = [];
    this.score = 0;
    this.lastNoteSpawn = 0;
    this.hitEffects = [];
    this.missEffects = [];
    this.lives = LIVES.INITIAL;
    this.startingLevel = this.currentLevel;
    this.lastLevelUpScore = 0;
    this.levelUpDisplay = null;

    // Changer l'état
    this.state = GAME_STATE.PLAYING;
    console.log('[Game] État changé à PLAYING');
    if (this.onStateChange) this.onStateChange(this.state);

    // Démarrer la mélodie de fond
    this.audio.startMelody();

    // Démarrer la boucle de jeu
    this.lastTime = performance.now();
    console.log('[Game] Lancement de la boucle de jeu');
    requestAnimationFrame(this._gameLoop);
  }

  /**
   * Met le jeu en pause
   */
  pause() {
    if (this.state !== GAME_STATE.PLAYING) return;

    this.state = GAME_STATE.PAUSED;
    this.audio.stopMelody();
    if (this.onStateChange) this.onStateChange(this.state);
  }

  /**
   * Reprend le jeu
   */
  resume() {
    if (this.state !== GAME_STATE.PAUSED) return;

    this.state = GAME_STATE.PLAYING;
    this.audio.startMelody();
    this.lastTime = performance.now();
    if (this.onStateChange) this.onStateChange(this.state);
    requestAnimationFrame(this._gameLoop);
  }

  /**
   * Bascule pause/reprise
   */
  togglePause() {
    if (this.state === GAME_STATE.PLAYING) {
      this.pause();
    } else if (this.state === GAME_STATE.PAUSED) {
      this.resume();
    }
  }

  /**
   * Arrête le jeu
   */
  stop() {
    this.audio.stopMelody();

    // Sauvegarder le score
    this.lastScore = this.score;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this._saveHighScore();
    }

    this.state = GAME_STATE.GAME_OVER;
    if (this.onStateChange) this.onStateChange(this.state);
  }

  /**
   * Retourne au menu
   */
  goToMenu() {
    this.state = GAME_STATE.MENU;
    this.renderer.drawMenu(this.highScore);
    if (this.onStateChange) this.onStateChange(this.state);
  }

  /**
   * Change le niveau
   * @param {number} levelIndex - Index du niveau (0-4)
   */
  setLevel(levelIndex) {
    if (this.state === GAME_STATE.PLAYING) return;
    this.currentLevel = Math.max(0, Math.min(levelIndex, LEVELS.length - 1));
  }

  /**
   * Retourne le niveau actuel
   * @returns {Object} Configuration du niveau
   */
  getCurrentLevel() {
    return LEVELS[this.currentLevel];
  }

  /**
   * Boucle de jeu principale
   * @param {number} timestamp - Temps actuel
   * @private
   */
  _gameLoop(timestamp) {
    // Calculer le delta time
    this.deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // Limiter le delta time pour éviter les sauts
    if (this.deltaTime > 100) {
      this.deltaTime = 16.67;
    }

    // Mise à jour
    this._update();

    // Rendu
    this._render();

    // Continuer la boucle si le jeu est en cours
    if (this.state === GAME_STATE.PLAYING) {
      requestAnimationFrame(this._gameLoop);
    } else if (this.state === GAME_STATE.PAUSED) {
      this.renderer.drawPauseOverlay();
    } else if (this.state === GAME_STATE.GAME_OVER) {
      const isNewHighScore = this.lastScore === this.highScore && this.lastScore > 0;
      this.renderer.drawGameOver(this.lastScore, this.highScore, isNewHighScore);
    }
  }

  /**
   * Met à jour la logique du jeu
   * @private
   */
  _update() {
    const level = this.getCurrentLevel();

    // Faire apparaître de nouvelles notes
    this.lastNoteSpawn += this.deltaTime;
    if (this.lastNoteSpawn >= level.spawnInterval) {
      this._spawnNote();
      this.lastNoteSpawn = 0;
    }

    // Mettre à jour les notes
    for (let i = this.notes.length - 1; i >= 0; i--) {
      const note = this.notes[i];
      const isVisible = note.update(level.speed, this.deltaTime);

      if (!isVisible) {
        // Note sortie de l'écran
        if (note.missed) {
          this.audio.playMissSound();
          this._addMissEffect(note.lane);
        }
        this.notes.splice(i, 1);
      }
    }

    // Mettre à jour les effets visuels
    this._updateEffects();
  }

  /**
   * Effectue le rendu du jeu
   * @private
   */
  _render() {
    // Effacer
    this.renderer.clear();

    // Dessiner les lanes
    this.renderer.drawLanes();

    // Dessiner les effets de hit/miss
    for (const effect of this.hitEffects) {
      this.renderer.drawHitEffect(effect.lane);
    }
    for (const effect of this.missEffects) {
      this.renderer.drawMissEffect(effect.lane);
    }

    // Dessiner la zone de hit
    this.renderer.drawHitZone();

    // Dessiner les notes
    for (const note of this.notes) {
      this.renderer.drawNote(note.getRenderData());
    }

    // Dessiner le piano
    this.renderer.drawPiano(this.input.getActiveNotes());

    // Dessiner l'UI
    this.renderer.drawUI({
      score: this.score,
      highScore: this.highScore,
      level: this.currentLevel,
      levelName: this.getCurrentLevel().name,
      lives: this.lives,
      maxLives: LIVES.MAX
    });

    // Afficher le level up si actif
    if (this.levelUpDisplay) {
      this.renderer.drawLevelUp();
    }
  }

  /**
   * Fait apparaître une nouvelle note
   * @private
   */
  _spawnNote() {
    const note = Note.createRandom(BONUS.CHANCE);
    this.notes.push(note);
  }

  /**
   * Gère l'appui sur une note
   * @param {string} noteType - Type de note pressée
   * @private
   */
  _handleNotePress(noteType) {
    if (this.state !== GAME_STATE.PLAYING) return;

    // Chercher une note correspondante dans la zone de hit
    for (const note of this.notes) {
      if (note.type === noteType && note.canBeHit()) {
        note.markAsHit();

        // Calculer le score
        const points = note.isBonus ? SCORE.BONUS_HIT : SCORE.HIT;
        this.score += points;

        // Jouer le son
        if (note.isBonus) {
          this.audio.playBonusSound();
        } else {
          this.audio.playHitSound(noteType);
        }

        // Effet visuel
        this._addHitEffect(note.lane);

        // Vérifier le level up
        this._checkLevelUp();

        // Callback
        if (this.onScoreChange) this.onScoreChange(this.score);

        return; // Une seule note à la fois
      }
    }

    // Aucune note trouvée = erreur, perte de vie
    this._loseLife(noteType);
  }

  /**
   * Perd une vie suite à une erreur
   * @param {string} noteType - Type de note erronée
   * @private
   */
  _loseLife(noteType) {
    this.lives--;
    this.audio.playMissSound();

    // Trouver la lane correspondant à la touche
    const laneIndex = ['C', 'D', 'E', 'F', 'G', 'A', 'B'].indexOf(noteType);
    if (laneIndex !== -1) {
      this._addMissEffect(laneIndex);
    }

    // Callback pour mettre à jour l'UI
    if (this.onLivesChange) this.onLivesChange(this.lives);

    // Game over si plus de vies
    if (this.lives <= 0) {
      this.stop();
    }
  }

  /**
   * Vérifie si un level up est nécessaire
   * @private
   */
  _checkLevelUp() {
    const threshold = LEVEL_UP.SCORE_THRESHOLD;
    const currentThreshold = Math.floor(this.score / threshold);
    const lastThreshold = Math.floor(this.lastLevelUpScore / threshold);

    if (currentThreshold > lastThreshold) {
      this.lastLevelUpScore = this.score;

      // Augmenter le niveau si possible
      if (this.currentLevel < LEVELS.length - 1) {
        this.currentLevel++;
        this.levelUpDisplay = { timer: LEVEL_UP.DISPLAY_DURATION };

        // Callback pour notifier l'UI
        if (this.onLevelChange) this.onLevelChange(this.currentLevel);
      }
    }
  }

  /**
   * Ajoute un effet de hit
   * @param {number} lane - Index de la lane
   * @private
   */
  _addHitEffect(lane) {
    this.hitEffects.push({ lane, timer: 100 });
  }

  /**
   * Ajoute un effet de miss
   * @param {number} lane - Index de la lane
   * @private
   */
  _addMissEffect(lane) {
    this.missEffects.push({ lane, timer: 150 });
  }

  /**
   * Met à jour les effets visuels temporaires
   * @private
   */
  _updateEffects() {
    // Effets de hit
    for (let i = this.hitEffects.length - 1; i >= 0; i--) {
      this.hitEffects[i].timer -= this.deltaTime;
      if (this.hitEffects[i].timer <= 0) {
        this.hitEffects.splice(i, 1);
      }
    }

    // Effets de miss
    for (let i = this.missEffects.length - 1; i >= 0; i--) {
      this.missEffects[i].timer -= this.deltaTime;
      if (this.missEffects[i].timer <= 0) {
        this.missEffects.splice(i, 1);
      }
    }

    // Timer level up
    if (this.levelUpDisplay) {
      this.levelUpDisplay.timer -= this.deltaTime;
      if (this.levelUpDisplay.timer <= 0) {
        this.levelUpDisplay = null;
      }
    }
  }

  /**
   * Charge le meilleur score depuis le localStorage
   * @returns {number} Meilleur score
   * @private
   */
  _loadHighScore() {
    try {
      const saved = localStorage.getItem('herodupianoHighScore');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Sauvegarde le meilleur score dans le localStorage
   * @private
   */
  _saveHighScore() {
    try {
      localStorage.setItem('herodupianoHighScore', this.highScore.toString());
    } catch {
      // Ignorer les erreurs de localStorage
    }
  }

  /**
   * Nettoie les ressources
   */
  destroy() {
    this.input.destroy();
    this.audio.destroy();
  }
}
