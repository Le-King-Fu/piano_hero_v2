/**
 * Tests unitaires pour la classe Game
 * Focus sur les nouvelles fonctionnalités : vies et level up
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LIVES, LEVEL_UP, LEVELS, GAME_STATE, SCORE } from '../src/config.js';

// Mock des dépendances du jeu
vi.mock('../src/systems/Renderer.js', () => ({
  Renderer: vi.fn().mockImplementation(() => ({
    drawMenu: vi.fn(),
    drawUI: vi.fn(),
    drawLanes: vi.fn(),
    drawHitZone: vi.fn(),
    drawNote: vi.fn(),
    drawPiano: vi.fn(),
    drawLevelUp: vi.fn(),
    drawHitEffect: vi.fn(),
    drawMissEffect: vi.fn(),
    drawPauseOverlay: vi.fn(),
    drawGameOver: vi.fn(),
    clear: vi.fn()
  }))
}));

vi.mock('../src/systems/Input.js', () => ({
  Input: vi.fn().mockImplementation(() => ({
    init: vi.fn(),
    setOnNotePress: vi.fn(),
    getActiveNotes: vi.fn().mockReturnValue([]),
    destroy: vi.fn()
  }))
}));

vi.mock('../src/systems/Audio.js', () => ({
  Audio: vi.fn().mockImplementation(() => ({
    init: vi.fn(),
    playHitSound: vi.fn(),
    playBonusSound: vi.fn(),
    playMissSound: vi.fn(),
    startMelody: vi.fn(),
    stopMelody: vi.fn(),
    toggleMute: vi.fn(),
    destroy: vi.fn()
  }))
}));

// Import après les mocks
import { Game } from '../src/game.js';

describe('Game - Système de vies', () => {
  let game;
  let mockCanvas;

  beforeEach(() => {
    vi.useFakeTimers();
    mockCanvas = {
      getContext: vi.fn().mockReturnValue({
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        fillText: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn()
      }),
      width: 320,
      height: 240,
      style: {}
    };
    game = new Game(mockCanvas);
  });

  afterEach(() => {
    game.state = GAME_STATE.MENU; // Arrête la boucle de jeu
    vi.useRealTimers();
  });

  describe('initialisation des vies', () => {
    it('initialise avec le bon nombre de vies', () => {
      expect(game.lives).toBe(LIVES.INITIAL);
    });

    it('réinitialise les vies au démarrage', () => {
      game.lives = 2;
      game.start();
      expect(game.lives).toBe(LIVES.INITIAL);
    });
  });

  describe('_loseLife', () => {
    beforeEach(() => {
      game.start();
    });

    it('décrémente le nombre de vies', () => {
      const initialLives = game.lives;
      game._loseLife('C');
      expect(game.lives).toBe(initialLives - 1);
    });

    it('joue le son de miss', () => {
      game._loseLife('D');
      expect(game.audio.playMissSound).toHaveBeenCalled();
    });

    it('appelle le callback onLivesChange', () => {
      const mockCallback = vi.fn();
      game.onLivesChange = mockCallback;
      game._loseLife('E');
      expect(mockCallback).toHaveBeenCalledWith(game.lives);
    });

    it('déclenche game over quand les vies tombent à 0', () => {
      game.lives = 1;
      game._loseLife('F');
      expect(game.state).toBe(GAME_STATE.GAME_OVER);
    });

    it('ne déclenche pas game over si des vies restent', () => {
      game.lives = 3;
      game._loseLife('G');
      expect(game.state).toBe(GAME_STATE.PLAYING);
      expect(game.lives).toBe(2);
    });
  });
});

describe('Game - Level Up automatique', () => {
  let game;
  let mockCanvas;

  beforeEach(() => {
    vi.useFakeTimers();
    mockCanvas = {
      getContext: vi.fn().mockReturnValue({
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        fillText: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn()
      }),
      width: 320,
      height: 240,
      style: {}
    };
    game = new Game(mockCanvas);
    game.start();
  });

  afterEach(() => {
    game.state = GAME_STATE.MENU;
    vi.useRealTimers();
  });

  describe('initialisation', () => {
    it('initialise lastLevelUpScore à 0', () => {
      expect(game.lastLevelUpScore).toBe(0);
    });

    it('initialise levelUpDisplay à null', () => {
      expect(game.levelUpDisplay).toBeNull();
    });

    it('sauvegarde le niveau de départ', () => {
      game.currentLevel = 2;
      game.start();
      expect(game.startingLevel).toBe(2);
    });
  });

  describe('_checkLevelUp', () => {
    it('ne change pas de niveau avant le seuil', () => {
      game.currentLevel = 0;
      game.score = LEVEL_UP.SCORE_THRESHOLD - 1;
      game._checkLevelUp();
      expect(game.currentLevel).toBe(0);
    });

    it('augmente le niveau au seuil', () => {
      game.currentLevel = 0;
      game.score = LEVEL_UP.SCORE_THRESHOLD;
      game._checkLevelUp();
      expect(game.currentLevel).toBe(1);
    });

    it('active l\'affichage du level up', () => {
      game.currentLevel = 0;
      game.score = LEVEL_UP.SCORE_THRESHOLD;
      game._checkLevelUp();
      expect(game.levelUpDisplay).not.toBeNull();
      expect(game.levelUpDisplay.timer).toBe(LEVEL_UP.DISPLAY_DURATION);
    });

    it('appelle le callback onLevelChange', () => {
      const mockCallback = vi.fn();
      game.onLevelChange = mockCallback;
      game.currentLevel = 0;
      game.score = LEVEL_UP.SCORE_THRESHOLD;
      game._checkLevelUp();
      expect(mockCallback).toHaveBeenCalledWith(1);
    });

    it('augmente plusieurs fois le niveau avec le score', () => {
      game.currentLevel = 0;
      game.score = LEVEL_UP.SCORE_THRESHOLD;
      game._checkLevelUp();
      expect(game.currentLevel).toBe(1);

      game.score = LEVEL_UP.SCORE_THRESHOLD * 2;
      game._checkLevelUp();
      expect(game.currentLevel).toBe(2);
    });

    it('ne dépasse pas le niveau maximum', () => {
      game.currentLevel = LEVELS.length - 1;
      game.score = LEVEL_UP.SCORE_THRESHOLD * 10;
      game._checkLevelUp();
      expect(game.currentLevel).toBe(LEVELS.length - 1);
    });

    it('n\'affiche pas level up au niveau max', () => {
      game.currentLevel = LEVELS.length - 1;
      game.score = LEVEL_UP.SCORE_THRESHOLD * 10;
      game._checkLevelUp();
      expect(game.levelUpDisplay).toBeNull();
    });
  });

  describe('timer levelUpDisplay', () => {
    it('décrémente le timer dans _updateEffects', () => {
      game.levelUpDisplay = { timer: 1000 };
      game.deltaTime = 100;
      game._updateEffects();
      expect(game.levelUpDisplay.timer).toBe(900);
    });

    it('supprime levelUpDisplay quand le timer expire', () => {
      game.levelUpDisplay = { timer: 50 };
      game.deltaTime = 100;
      game._updateEffects();
      expect(game.levelUpDisplay).toBeNull();
    });
  });
});

describe('Game - Gestion des erreurs de touche', () => {
  let game;
  let mockCanvas;
  let notePressHandler;

  beforeEach(() => {
    vi.useFakeTimers();
    mockCanvas = {
      getContext: vi.fn().mockReturnValue({
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        fillText: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn()
      }),
      width: 320,
      height: 240,
      style: {}
    };
    game = new Game(mockCanvas);

    // Capturer le handler de note press
    game.input.setOnNotePress = vi.fn((handler) => {
      notePressHandler = handler;
    });

    game.init();
    game.start();
  });

  afterEach(() => {
    game.state = GAME_STATE.MENU;
    vi.useRealTimers();
  });

  it('perd une vie si aucune note ne correspond', () => {
    // Pas de notes dans la zone de hit
    game.notes = [];
    const initialLives = game.lives;

    // Simuler une pression sur une touche
    game._handleNotePress('C');

    expect(game.lives).toBe(initialLives - 1);
  });

  it('ne perd pas de vie si une note correspond', () => {
    // Créer une note mockée dans la zone de hit
    const mockNote = {
      type: 'C',
      canBeHit: vi.fn().mockReturnValue(true),
      markAsHit: vi.fn(),
      isBonus: false,
      lane: 0
    };
    game.notes = [mockNote];
    const initialLives = game.lives;

    game._handleNotePress('C');

    expect(game.lives).toBe(initialLives);
    expect(mockNote.markAsHit).toHaveBeenCalled();
  });
});
