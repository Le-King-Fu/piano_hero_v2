/**
 * Système de gestion des entrées (clavier et tactile)
 */

import { KEY_MAP, NOTES } from '../config.js';

export class Input {
  /**
   * Crée le gestionnaire d'entrées
   */
  constructor() {
    // État des touches pressées
    this.keysDown = new Set();

    // Callbacks pour les événements
    this.onNotePress = null;
    this.onNoteRelease = null;

    // Référence aux handlers pour pouvoir les retirer
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleKeyUp = this._handleKeyUp.bind(this);
    this._handleTouchStart = this._handleTouchStart.bind(this);
    this._handleTouchEnd = this._handleTouchEnd.bind(this);

    // État d'initialisation
    this.initialized = false;
  }

  /**
   * Initialise les écouteurs d'événements
   */
  init() {
    if (this.initialized) return;

    document.addEventListener('keydown', this._handleKeyDown);
    document.addEventListener('keyup', this._handleKeyUp);

    this.initialized = true;
  }

  /**
   * Configure les écouteurs tactiles pour les touches du piano
   * @param {HTMLElement} pianoContainer - Conteneur des touches du piano
   */
  setupTouchInput(pianoContainer) {
    if (!pianoContainer) return;

    const keys = pianoContainer.querySelectorAll('.key');
    keys.forEach(key => {
      key.addEventListener('touchstart', this._handleTouchStart, { passive: false });
      key.addEventListener('touchend', this._handleTouchEnd, { passive: false });
      key.addEventListener('mousedown', this._handleTouchStart);
      key.addEventListener('mouseup', this._handleTouchEnd);
      key.addEventListener('mouseleave', this._handleTouchEnd);
    });
  }

  /**
   * Nettoie les écouteurs d'événements
   */
  destroy() {
    document.removeEventListener('keydown', this._handleKeyDown);
    document.removeEventListener('keyup', this._handleKeyUp);
    this.initialized = false;
  }

  /**
   * Définit le callback pour les pressions de notes
   * @param {Function} callback - Fonction appelée avec la note en paramètre
   */
  setOnNotePress(callback) {
    this.onNotePress = callback;
  }

  /**
   * Définit le callback pour les relâchements de notes
   * @param {Function} callback - Fonction appelée avec la note en paramètre
   */
  setOnNoteRelease(callback) {
    this.onNoteRelease = callback;
  }

  /**
   * Vérifie si une note est actuellement pressée
   * @param {string} note - Note à vérifier
   * @returns {boolean} True si la note est pressée
   */
  isNoteDown(note) {
    return this.keysDown.has(note);
  }

  /**
   * Retourne toutes les notes actuellement pressées
   * @returns {string[]} Tableau des notes pressées
   */
  getActiveNotes() {
    return Array.from(this.keysDown);
  }

  /**
   * Gère l'appui sur une touche
   * @param {KeyboardEvent} event
   * @private
   */
  _handleKeyDown(event) {
    const key = event.key.toLowerCase();
    const note = KEY_MAP[key];

    if (note && !this.keysDown.has(note)) {
      this.keysDown.add(note);

      if (this.onNotePress) {
        this.onNotePress(note);
      }
    }
  }

  /**
   * Gère le relâchement d'une touche
   * @param {KeyboardEvent} event
   * @private
   */
  _handleKeyUp(event) {
    const key = event.key.toLowerCase();
    const note = KEY_MAP[key];

    if (note && this.keysDown.has(note)) {
      this.keysDown.delete(note);

      if (this.onNoteRelease) {
        this.onNoteRelease(note);
      }
    }
  }

  /**
   * Gère le début d'un toucher sur une touche du piano
   * @param {TouchEvent|MouseEvent} event
   * @private
   */
  _handleTouchStart(event) {
    event.preventDefault();

    const target = event.currentTarget;
    const note = target.dataset.note;

    if (note && NOTES.includes(note) && !this.keysDown.has(note)) {
      this.keysDown.add(note);
      target.classList.add('active');

      if (this.onNotePress) {
        this.onNotePress(note);
      }
    }
  }

  /**
   * Gère la fin d'un toucher sur une touche du piano
   * @param {TouchEvent|MouseEvent} event
   * @private
   */
  _handleTouchEnd(event) {
    event.preventDefault();

    const target = event.currentTarget;
    const note = target.dataset.note;

    if (note && this.keysDown.has(note)) {
      this.keysDown.delete(note);
      target.classList.remove('active');

      if (this.onNoteRelease) {
        this.onNoteRelease(note);
      }
    }
  }

  /**
   * Convertit une touche clavier en note
   * @param {string} key - Touche clavier
   * @returns {string|null} Note correspondante ou null
   */
  static keyToNote(key) {
    return KEY_MAP[key.toLowerCase()] || null;
  }

  /**
   * Retourne toutes les touches clavier associées à une note
   * @param {string} note - Note recherchée
   * @returns {string[]} Touches clavier
   */
  static getNoteKeys(note) {
    return Object.entries(KEY_MAP)
      .filter(([_, n]) => n === note)
      .map(([k, _]) => k.toUpperCase());
  }
}
