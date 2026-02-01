/**
 * Service Leaderboard - Intégration Supabase (placeholder)
 * Pour activer : configurer SUPABASE_URL et SUPABASE_KEY dans config.js
 */

import { LEADERBOARD } from '../config.js';

/**
 * Classe de gestion du leaderboard
 * Utilise Supabase pour le stockage distant
 */
export class Leaderboard {
  constructor() {
    this.enabled = LEADERBOARD.ENABLED;
    this.client = null;
    this.scores = [];

    if (this.enabled) {
      this.initSupabase();
    }
  }

  /**
   * Initialise le client Supabase
   */
  async initSupabase() {
    try {
      // Import dynamique de Supabase (à installer: npm install @supabase/supabase-js)
      // const { createClient } = await import('@supabase/supabase-js');
      // this.client = createClient(LEADERBOARD.SUPABASE_URL, LEADERBOARD.SUPABASE_KEY);
      console.log('[Leaderboard] Supabase non configuré - mode placeholder');
    } catch (error) {
      console.error('[Leaderboard] Erreur initialisation Supabase:', error);
      this.enabled = false;
    }
  }

  /**
   * Récupère les meilleurs scores
   * @param {number} limit - Nombre de scores à récupérer
   * @returns {Promise<Array>} Liste des scores
   */
  async getTopScores(limit = 10) {
    if (!this.enabled || !this.client) {
      // Retourne des scores placeholder
      return this.getPlaceholderScores(limit);
    }

    try {
      const { data, error } = await this.client
        .from(LEADERBOARD.TABLE_NAME)
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      this.scores = data;
      return data;
    } catch (error) {
      console.error('[Leaderboard] Erreur récupération scores:', error);
      return this.getPlaceholderScores(limit);
    }
  }

  /**
   * Soumet un nouveau score
   * @param {string} playerName - Nom du joueur
   * @param {number} score - Score obtenu
   * @param {number} level - Niveau atteint
   * @returns {Promise<boolean>} Succès de la soumission
   */
  async submitScore(playerName, score, level = 1) {
    if (!this.enabled || !this.client) {
      console.log('[Leaderboard] Score non soumis (désactivé):', { playerName, score, level });
      return false;
    }

    try {
      const { error } = await this.client
        .from(LEADERBOARD.TABLE_NAME)
        .insert([
          {
            player_name: playerName,
            score: score,
            level: level,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      console.log('[Leaderboard] Score soumis:', { playerName, score });
      return true;
    } catch (error) {
      console.error('[Leaderboard] Erreur soumission score:', error);
      return false;
    }
  }

  /**
   * Vérifie si un score est dans le top 10
   * @param {number} score - Score à vérifier
   * @returns {Promise<boolean>}
   */
  async isHighScore(score) {
    const topScores = await this.getTopScores(10);
    if (topScores.length < 10) return true;
    return score > topScores[topScores.length - 1].score;
  }

  /**
   * Retourne des scores placeholder pour le mode désactivé
   * @param {number} limit - Nombre de scores
   * @returns {Array}
   */
  getPlaceholderScores(limit = 5) {
    return [
      { rank: 1, player_name: '---', score: 0 },
      { rank: 2, player_name: '---', score: 0 },
      { rank: 3, player_name: '---', score: 0 },
      { rank: 4, player_name: '---', score: 0 },
      { rank: 5, player_name: '---', score: 0 }
    ].slice(0, limit);
  }

  /**
   * Retourne le statut du leaderboard
   * @returns {string}
   */
  getStatus() {
    if (!this.enabled) {
      return 'Leaderboard désactivé';
    }
    if (!this.client) {
      return 'Connexion en cours...';
    }
    return 'Connecté';
  }
}

// Instance singleton
export const leaderboard = new Leaderboard();
