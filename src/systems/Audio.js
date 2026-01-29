/**
 * Système audio 8-bit pour Héro du Piano
 * Utilise des ondes carrées pour un son rétro Game Boy
 */

import { NOTE_FREQ, MELODY } from '../config.js';

export class Audio {
  constructor() {
    /** @type {AudioContext|null} */
    this.context = null;

    /** @type {GainNode|null} */
    this.masterGain = null;

    // Mélodie de fond
    this.melodyInterval = null;
    this.melodyIndex = 0;

    // Volume global
    this.volume = 0.3;
    this.muted = false;
  }

  /**
   * Initialise le contexte audio (doit être appelé après une interaction utilisateur)
   * @returns {boolean} True si l'initialisation a réussi
   */
  init() {
    if (this.context) return true;

    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = this.volume;
      return true;
    } catch (error) {
      console.warn('Impossible d\'initialiser l\'audio:', error);
      return false;
    }
  }

  /**
   * Joue une note avec une onde carrée (son 8-bit)
   * @param {number} frequency - Fréquence en Hz
   * @param {number} duration - Durée en secondes
   * @param {number} volume - Volume (0-1)
   */
  playTone(frequency, duration = 0.15, volume = 0.2) {
    if (!this.context || this.muted) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Onde carrée pour le son 8-bit
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);

    // Enveloppe simple (attaque rapide, déclin)
    gainNode.gain.setValueAtTime(0, this.context.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.context.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + duration);
  }

  /**
   * Joue le son d'une note de piano
   * @param {string} note - Note (C, D, E, F, G, A, B)
   */
  playNote(note) {
    const freq = NOTE_FREQ[note];
    if (freq) {
      this.playTone(freq, 0.15, 0.25);
    }
  }

  /**
   * Joue le son de hit (note réussie)
   * @param {string} note - Note touchée
   */
  playHitSound(note) {
    const freq = NOTE_FREQ[note];
    if (freq) {
      // Son plus court et percussif
      this.playTone(freq, 0.1, 0.3);
    }
  }

  /**
   * Joue le son de bonus (arpège ascendant)
   */
  playBonusSound() {
    if (!this.context || this.muted) return;

    // Arpège C-E-G rapide
    this.playTone(523.25, 0.08, 0.2);  // C5
    setTimeout(() => this.playTone(659.25, 0.08, 0.2), 40);  // E5
    setTimeout(() => this.playTone(783.99, 0.12, 0.25), 80); // G5
  }

  /**
   * Joue le son d'erreur (note ratée)
   */
  playMissSound() {
    if (!this.context || this.muted) return;

    // Son dissonant avec deux fréquences proches
    const oscillator1 = this.context.createOscillator();
    const oscillator2 = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator1.type = 'sawtooth';
    oscillator2.type = 'sawtooth';
    oscillator1.frequency.setValueAtTime(110, this.context.currentTime);
    oscillator2.frequency.setValueAtTime(117, this.context.currentTime);

    gainNode.gain.setValueAtTime(0.15, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);

    oscillator1.start(this.context.currentTime);
    oscillator2.start(this.context.currentTime);
    oscillator1.stop(this.context.currentTime + 0.2);
    oscillator2.stop(this.context.currentTime + 0.2);
  }

  /**
   * Démarre la mélodie de fond
   * @param {number} interval - Intervalle entre les notes (ms)
   */
  startMelody(interval = 400) {
    this.stopMelody();
    this.melodyIndex = 0;

    this.melodyInterval = setInterval(() => {
      if (this.muted) return;

      const note = MELODY[this.melodyIndex];
      const freq = NOTE_FREQ[note];
      if (freq) {
        this.playTone(freq, 0.3, 0.08); // Volume faible pour la mélodie de fond
      }
      this.melodyIndex = (this.melodyIndex + 1) % MELODY.length;
    }, interval);
  }

  /**
   * Arrête la mélodie de fond
   */
  stopMelody() {
    if (this.melodyInterval) {
      clearInterval(this.melodyInterval);
      this.melodyInterval = null;
    }
  }

  /**
   * Active/désactive le son
   * @param {boolean} muted - True pour couper le son
   */
  setMuted(muted) {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : this.volume;
    }
  }

  /**
   * Bascule l'état muet
   * @returns {boolean} Nouvel état muet
   */
  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /**
   * Définit le volume global
   * @param {number} volume - Volume (0-1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && !this.muted) {
      this.masterGain.gain.value = this.volume;
    }
  }

  /**
   * Nettoie les ressources audio
   */
  destroy() {
    this.stopMelody();
    if (this.context) {
      this.context.close();
      this.context = null;
    }
  }
}
