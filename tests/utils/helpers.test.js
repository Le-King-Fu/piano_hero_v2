/**
 * Tests unitaires pour les fonctions utilitaires
 */

import { describe, it, expect } from 'vitest';
import {
  randomInt,
  rectsOverlap,
  clamp,
  formatScore,
  getLaneIndex,
  isInHitZone,
  lerp,
  formatTime
} from '../../src/utils/helpers.js';

describe('helpers', () => {
  describe('randomInt', () => {
    it('retourne un entier entre min et max', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomInt(5, 10);
        expect(result).toBeGreaterThanOrEqual(5);
        expect(result).toBeLessThanOrEqual(10);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    it('retourne min si min === max', () => {
      expect(randomInt(7, 7)).toBe(7);
    });

    it('fonctionne avec des valeurs négatives', () => {
      for (let i = 0; i < 50; i++) {
        const result = randomInt(-10, -5);
        expect(result).toBeGreaterThanOrEqual(-10);
        expect(result).toBeLessThanOrEqual(-5);
      }
    });
  });

  describe('rectsOverlap', () => {
    it('détecte une collision entre deux rectangles qui se chevauchent', () => {
      const rect1 = { x: 0, y: 0, width: 10, height: 10 };
      const rect2 = { x: 5, y: 5, width: 10, height: 10 };
      expect(rectsOverlap(rect1, rect2)).toBe(true);
    });

    it('ne détecte pas de collision entre deux rectangles séparés', () => {
      const rect1 = { x: 0, y: 0, width: 10, height: 10 };
      const rect2 = { x: 20, y: 20, width: 10, height: 10 };
      expect(rectsOverlap(rect1, rect2)).toBe(false);
    });

    it('détecte une collision quand un rectangle est contenu dans l\'autre', () => {
      const rect1 = { x: 0, y: 0, width: 100, height: 100 };
      const rect2 = { x: 25, y: 25, width: 10, height: 10 };
      expect(rectsOverlap(rect1, rect2)).toBe(true);
    });

    it('ne détecte pas de collision quand les rectangles se touchent juste', () => {
      const rect1 = { x: 0, y: 0, width: 10, height: 10 };
      const rect2 = { x: 10, y: 0, width: 10, height: 10 };
      expect(rectsOverlap(rect1, rect2)).toBe(false);
    });
  });

  describe('clamp', () => {
    it('retourne la valeur si elle est dans l\'intervalle', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it('retourne min si la valeur est inférieure', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it('retourne max si la valeur est supérieure', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('fonctionne avec des décimaux', () => {
      expect(clamp(0.5, 0, 1)).toBe(0.5);
      expect(clamp(-0.5, 0, 1)).toBe(0);
      expect(clamp(1.5, 0, 1)).toBe(1);
    });
  });

  describe('formatScore', () => {
    it('formate un petit nombre sans espace', () => {
      expect(formatScore(100)).toBe('100');
    });

    it('formate un grand nombre avec des espaces', () => {
      expect(formatScore(1000)).toBe('1 000');
      expect(formatScore(1000000)).toBe('1 000 000');
    });

    it('gère zéro', () => {
      expect(formatScore(0)).toBe('0');
    });
  });

  describe('getLaneIndex', () => {
    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

    it('retourne l\'index correct pour chaque note', () => {
      expect(getLaneIndex('C', notes)).toBe(0);
      expect(getLaneIndex('D', notes)).toBe(1);
      expect(getLaneIndex('G', notes)).toBe(4);
      expect(getLaneIndex('B', notes)).toBe(6);
    });

    it('retourne -1 pour une note invalide', () => {
      expect(getLaneIndex('X', notes)).toBe(-1);
      expect(getLaneIndex('', notes)).toBe(-1);
    });
  });

  describe('isInHitZone', () => {
    const hitZoneY = 200;
    const tolerance = 15;
    const noteHeight = 20;

    it('retourne true si la note est dans la zone de hit', () => {
      // Note pile dans la zone
      expect(isInHitZone(195, noteHeight, hitZoneY, tolerance)).toBe(true);
    });

    it('retourne true si la note est juste au-dessus de la zone (dans la tolérance)', () => {
      expect(isInHitZone(180, noteHeight, hitZoneY, tolerance)).toBe(true);
    });

    it('retourne true si la note est juste en-dessous de la zone (dans la tolérance)', () => {
      expect(isInHitZone(210, noteHeight, hitZoneY, tolerance)).toBe(true);
    });

    it('retourne false si la note est trop haute', () => {
      expect(isInHitZone(100, noteHeight, hitZoneY, tolerance)).toBe(false);
    });

    it('retourne false si la note est trop basse', () => {
      expect(isInHitZone(250, noteHeight, hitZoneY, tolerance)).toBe(false);
    });
  });

  describe('lerp', () => {
    it('retourne a quand t = 0', () => {
      expect(lerp(10, 20, 0)).toBe(10);
    });

    it('retourne b quand t = 1', () => {
      expect(lerp(10, 20, 1)).toBe(20);
    });

    it('retourne la valeur médiane quand t = 0.5', () => {
      expect(lerp(0, 100, 0.5)).toBe(50);
    });

    it('limite t à [0, 1]', () => {
      expect(lerp(0, 100, -1)).toBe(0);
      expect(lerp(0, 100, 2)).toBe(100);
    });

    it('fonctionne avec des valeurs négatives', () => {
      expect(lerp(-10, 10, 0.5)).toBe(0);
    });
  });

  describe('formatTime', () => {
    it('formate correctement les secondes', () => {
      expect(formatTime(5000)).toBe('0:05');
      expect(formatTime(30000)).toBe('0:30');
    });

    it('formate correctement les minutes', () => {
      expect(formatTime(60000)).toBe('1:00');
      expect(formatTime(90000)).toBe('1:30');
    });

    it('formate correctement les grandes durées', () => {
      expect(formatTime(3600000)).toBe('60:00');
    });

    it('gère zéro', () => {
      expect(formatTime(0)).toBe('0:00');
    });
  });
});
