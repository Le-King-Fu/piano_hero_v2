/**
 * Tests unitaires pour le système Input
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Input } from '../../src/systems/Input.js';
import { KEY_MAP, NOTES } from '../../src/config.js';

describe('Input', () => {
  let input;

  beforeEach(() => {
    input = new Input();
  });

  afterEach(() => {
    input.destroy();
  });

  describe('constructor', () => {
    it('initialise avec un ensemble de touches vide', () => {
      expect(input.keysDown.size).toBe(0);
    });

    it('initialise sans callbacks', () => {
      expect(input.onNotePress).toBeNull();
      expect(input.onNoteRelease).toBeNull();
    });

    it('n\'est pas initialisé par défaut', () => {
      expect(input.initialized).toBe(false);
    });
  });

  describe('init', () => {
    it('marque le système comme initialisé', () => {
      input.init();
      expect(input.initialized).toBe(true);
    });

    it('ne s\'initialise pas deux fois', () => {
      const spy = vi.spyOn(document, 'addEventListener');
      input.init();
      input.init();
      // Devrait avoir été appelé seulement 2 fois (keydown et keyup)
      expect(spy).toHaveBeenCalledTimes(2);
      spy.mockRestore();
    });
  });

  describe('destroy', () => {
    it('marque le système comme non initialisé', () => {
      input.init();
      input.destroy();
      expect(input.initialized).toBe(false);
    });
  });

  describe('setOnNotePress', () => {
    it('définit le callback de pression de note', () => {
      const callback = vi.fn();
      input.setOnNotePress(callback);
      expect(input.onNotePress).toBe(callback);
    });
  });

  describe('setOnNoteRelease', () => {
    it('définit le callback de relâchement de note', () => {
      const callback = vi.fn();
      input.setOnNoteRelease(callback);
      expect(input.onNoteRelease).toBe(callback);
    });
  });

  describe('isNoteDown', () => {
    it('retourne false pour une note non pressée', () => {
      expect(input.isNoteDown('C')).toBe(false);
    });

    it('retourne true pour une note pressée', () => {
      input.keysDown.add('C');
      expect(input.isNoteDown('C')).toBe(true);
    });
  });

  describe('getActiveNotes', () => {
    it('retourne un tableau vide quand aucune note n\'est pressée', () => {
      expect(input.getActiveNotes()).toEqual([]);
    });

    it('retourne les notes pressées', () => {
      input.keysDown.add('C');
      input.keysDown.add('E');
      const active = input.getActiveNotes();
      expect(active).toContain('C');
      expect(active).toContain('E');
      expect(active.length).toBe(2);
    });
  });

  describe('_handleKeyDown', () => {
    beforeEach(() => {
      input.init();
    });

    it('ajoute la note aux touches pressées', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      document.dispatchEvent(event);
      expect(input.keysDown.has('C')).toBe(true);
    });

    it('appelle le callback onNotePress', () => {
      const callback = vi.fn();
      input.setOnNotePress(callback);

      const event = new KeyboardEvent('keydown', { key: 's' });
      document.dispatchEvent(event);

      expect(callback).toHaveBeenCalledWith('D');
    });

    it('ignore les touches non mappées', () => {
      const callback = vi.fn();
      input.setOnNotePress(callback);

      const event = new KeyboardEvent('keydown', { key: 'z' });
      document.dispatchEvent(event);

      expect(callback).not.toHaveBeenCalled();
    });

    it('n\'appelle pas le callback si la touche est déjà pressée', () => {
      const callback = vi.fn();
      input.setOnNotePress(callback);

      const event1 = new KeyboardEvent('keydown', { key: 'd' });
      const event2 = new KeyboardEvent('keydown', { key: 'd' });

      document.dispatchEvent(event1);
      document.dispatchEvent(event2);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('gère les majuscules', () => {
      const event = new KeyboardEvent('keydown', { key: 'A' });
      document.dispatchEvent(event);
      expect(input.keysDown.has('C')).toBe(true);
    });
  });

  describe('_handleKeyUp', () => {
    beforeEach(() => {
      input.init();
      input.keysDown.add('C');
    });

    it('retire la note des touches pressées', () => {
      const event = new KeyboardEvent('keyup', { key: 'a' });
      document.dispatchEvent(event);
      expect(input.keysDown.has('C')).toBe(false);
    });

    it('appelle le callback onNoteRelease', () => {
      const callback = vi.fn();
      input.setOnNoteRelease(callback);

      const event = new KeyboardEvent('keyup', { key: 'a' });
      document.dispatchEvent(event);

      expect(callback).toHaveBeenCalledWith('C');
    });

    it('ignore si la note n\'était pas pressée', () => {
      const callback = vi.fn();
      input.setOnNoteRelease(callback);
      input.keysDown.clear();

      const event = new KeyboardEvent('keyup', { key: 'a' });
      document.dispatchEvent(event);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('keyToNote (statique)', () => {
    it('convertit une touche clavier en note', () => {
      expect(Input.keyToNote('a')).toBe('C');
      expect(Input.keyToNote('s')).toBe('D');
      expect(Input.keyToNote('d')).toBe('E');
      expect(Input.keyToNote('f')).toBe('F');
      expect(Input.keyToNote('g')).toBe('G');
      expect(Input.keyToNote('h')).toBe('A');
      expect(Input.keyToNote('j')).toBe('B');
    });

    it('retourne null pour une touche non mappée', () => {
      expect(Input.keyToNote('z')).toBeNull();
      expect(Input.keyToNote('x')).toBeNull();
    });

    it('gère les majuscules', () => {
      expect(Input.keyToNote('A')).toBe('C');
    });
  });

  describe('getNoteKeys (statique)', () => {
    it('retourne les touches associées à une note', () => {
      const keysForC = Input.getNoteKeys('C');
      expect(keysForC).toContain('A');
    });

    it('retourne un tableau vide pour une note invalide', () => {
      expect(Input.getNoteKeys('X')).toEqual([]);
    });

    it('retourne les touches en majuscules', () => {
      const keys = Input.getNoteKeys('D');
      keys.forEach(key => {
        expect(key).toBe(key.toUpperCase());
      });
    });
  });

  describe('intégration avec KEY_MAP', () => {
    it('toutes les touches du KEY_MAP produisent des notes valides', () => {
      Object.keys(KEY_MAP).forEach(key => {
        const note = KEY_MAP[key];
        expect(NOTES).toContain(note);
      });
    });

    it('toutes les notes ont au moins une touche associée', () => {
      NOTES.forEach(note => {
        const keys = Input.getNoteKeys(note);
        expect(keys.length).toBeGreaterThan(0);
      });
    });
  });
});
