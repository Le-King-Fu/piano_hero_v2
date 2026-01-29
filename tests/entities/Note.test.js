/**
 * Tests unitaires pour la classe Note
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Note } from '../../src/entities/Note.js';
import { NOTES, NOTE, HIT_ZONE, CANVAS } from '../../src/config.js';

describe('Note', () => {
  describe('constructor', () => {
    it('crée une note avec le bon type', () => {
      const note = new Note('C');
      expect(note.type).toBe('C');
    });

    it('calcule la bonne lane pour chaque note', () => {
      NOTES.forEach((noteType, index) => {
        const note = new Note(noteType);
        expect(note.lane).toBe(index);
      });
    });

    it('initialise la position Y au-dessus du canvas', () => {
      const note = new Note('D');
      expect(note.y).toBe(-NOTE.HEIGHT);
    });

    it('marque correctement une note bonus', () => {
      const normalNote = new Note('E', false);
      const bonusNote = new Note('E', true);

      expect(normalNote.isBonus).toBe(false);
      expect(bonusNote.isBonus).toBe(true);
    });

    it('initialise hit et missed à false', () => {
      const note = new Note('F');
      expect(note.hit).toBe(false);
      expect(note.missed).toBe(false);
    });

    it('calcule la bonne position X basée sur la lane', () => {
      const note = new Note('C');
      const expectedX = 0 * (CANVAS.WIDTH / NOTES.length) + NOTE.PADDING;
      expect(note.x).toBe(expectedX);
    });
  });

  describe('update', () => {
    let note;

    beforeEach(() => {
      note = new Note('G');
      note.y = 0; // Commencer au haut du canvas
    });

    it('déplace la note vers le bas', () => {
      const initialY = note.y;
      note.update(1, 16.67); // ~1 frame à 60fps
      expect(note.y).toBeGreaterThan(initialY);
    });

    it('retourne true tant que la note est visible', () => {
      note.y = 100;
      const result = note.update(1, 16.67);
      expect(result).toBe(true);
    });

    it('retourne false quand la note sort du canvas', () => {
      note.y = CANVAS.HEIGHT + 10;
      const result = note.update(1, 16.67);
      expect(result).toBe(false);
    });

    it('marque la note comme missed si elle sort sans être touchée', () => {
      note.y = CANVAS.HEIGHT + 10;
      note.update(1, 16.67);
      expect(note.missed).toBe(true);
    });

    it('ne marque pas missed si la note a été touchée', () => {
      note.y = CANVAS.HEIGHT + 10;
      note.hit = true;
      note.update(1, 16.67);
      expect(note.missed).toBe(false);
    });

    it('respecte la vitesse donnée', () => {
      note.y = 0;
      note.update(2, 16.67); // Vitesse double
      const position1 = note.y;

      note.y = 0;
      note.update(1, 16.67); // Vitesse normale
      const position2 = note.y;

      expect(position1).toBeGreaterThan(position2);
    });

    it('incrémente le timer d\'animation de hit', () => {
      note.hit = true;
      note.hitAnimationTimer = 0;
      note.update(1, 50);
      expect(note.hitAnimationTimer).toBe(50);
    });
  });

  describe('canBeHit', () => {
    let note;

    beforeEach(() => {
      note = new Note('A');
    });

    it('retourne false si la note est déjà touchée', () => {
      note.y = HIT_ZONE.Y;
      note.hit = true;
      expect(note.canBeHit()).toBe(false);
    });

    it('retourne false si la note est manquée', () => {
      note.y = HIT_ZONE.Y;
      note.missed = true;
      expect(note.canBeHit()).toBe(false);
    });

    it('retourne true si la note est dans la zone de hit', () => {
      note.y = HIT_ZONE.Y;
      expect(note.canBeHit()).toBe(true);
    });

    it('retourne true si la note est juste au-dessus de la zone (dans la tolérance)', () => {
      note.y = HIT_ZONE.Y - HIT_ZONE.TOLERANCE;
      expect(note.canBeHit()).toBe(true);
    });

    it('retourne false si la note est trop haute', () => {
      note.y = 0;
      expect(note.canBeHit()).toBe(false);
    });

    it('retourne false si la note est trop basse', () => {
      note.y = CANVAS.HEIGHT;
      expect(note.canBeHit()).toBe(false);
    });
  });

  describe('markAsHit', () => {
    it('marque la note comme touchée', () => {
      const note = new Note('B');
      note.markAsHit();
      expect(note.hit).toBe(true);
    });

    it('réinitialise le timer d\'animation de hit', () => {
      const note = new Note('C');
      note.hitAnimationTimer = 100;
      note.markAsHit();
      expect(note.hitAnimationTimer).toBe(0);
    });
  });

  describe('isHitAnimationComplete', () => {
    let note;

    beforeEach(() => {
      note = new Note('D');
    });

    it('retourne false si la note n\'est pas touchée', () => {
      note.hit = false;
      note.hitAnimationTimer = 300;
      expect(note.isHitAnimationComplete()).toBe(false);
    });

    it('retourne false si l\'animation n\'est pas terminée', () => {
      note.hit = true;
      note.hitAnimationTimer = 100;
      expect(note.isHitAnimationComplete()).toBe(false);
    });

    it('retourne true si la note est touchée et l\'animation terminée', () => {
      note.hit = true;
      note.hitAnimationTimer = 250;
      expect(note.isHitAnimationComplete()).toBe(true);
    });
  });

  describe('getRenderData', () => {
    it('retourne les données de rendu correctes pour une note normale', () => {
      const note = new Note('E', false);
      note.y = 100;

      const data = note.getRenderData();

      expect(data.type).toBe('E');
      expect(data.lane).toBe(2);
      expect(data.y).toBe(100);
      expect(data.isBonus).toBe(false);
      expect(data.hit).toBe(false);
      expect(data.alpha).toBe(1);
      expect(data.scale).toBe(1);
    });

    it('retourne une opacité réduite pour une note touchée', () => {
      const note = new Note('F');
      note.hit = true;
      note.hitAnimationTimer = 100; // 50% de l'animation

      const data = note.getRenderData();
      expect(data.alpha).toBe(0.5);
    });

    it('retourne un scale variable pour une note bonus', () => {
      const note = new Note('G', true);
      note.animationFrame = Math.PI / 2; // sin = 1, scale max

      const data = note.getRenderData();
      expect(data.scale).toBeGreaterThan(1);
    });
  });

  describe('createRandom', () => {
    it('crée une note avec un type valide', () => {
      for (let i = 0; i < 50; i++) {
        const note = Note.createRandom();
        expect(NOTES).toContain(note.type);
      }
    });

    it('crée des notes bonus selon la probabilité', () => {
      // Avec 100% de chance, toutes les notes sont bonus
      const bonusNote = Note.createRandom(1);
      expect(bonusNote.isBonus).toBe(true);

      // Avec 0% de chance, aucune note n'est bonus
      const normalNote = Note.createRandom(0);
      expect(normalNote.isBonus).toBe(false);
    });

    it('utilise la chance par défaut de 15%', () => {
      // Test statistique : sur 1000 notes, environ 150 devraient être bonus
      let bonusCount = 0;
      for (let i = 0; i < 1000; i++) {
        if (Note.createRandom().isBonus) bonusCount++;
      }
      // Tolérance de 5% autour de 15%
      expect(bonusCount).toBeGreaterThan(100);
      expect(bonusCount).toBeLessThan(200);
    });
  });
});
