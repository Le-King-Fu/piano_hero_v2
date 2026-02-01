/**
 * Point d'entrée principal - Héro du Piano
 * Initialise le jeu et lie les événements DOM
 */

import { Game } from './game.js';
import { LEVELS, GAME_STATE, LIVES } from './config.js';
import { leaderboard } from './services/Leaderboard.js';

// Attendre le chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Piano Hero] Initialisation...');

  // Récupérer le canvas
  const canvas = document.getElementById('game-canvas');
  if (!canvas) {
    console.error('Canvas non trouvé !');
    return;
  }
  console.log('[Piano Hero] Canvas trouvé:', canvas);

  // Créer l'instance du jeu
  const game = new Game(canvas);
  console.log('[Piano Hero] Instance créée, état:', game.state);

  // Initialiser le jeu
  game.init();
  console.log('[Piano Hero] Jeu initialisé');

  // Configurer les écouteurs d'événements UI
  setupUIListeners(game);

  // Créer le sélecteur de niveau
  createLevelSelector(game);

  // Configurer les modales (aide et leaderboard)
  setupModals();

  // Afficher l'aide au premier lancement
  showHelpIfFirstTime();

  // Exposer le jeu pour le debug (optionnel)
  window.game = game;
  console.log('[Piano Hero] Prêt ! Tapez game.start() dans la console pour tester.');
});

/**
 * Configure les écouteurs d'événements de l'interface
 * @param {Game} game - Instance du jeu
 */
function setupUIListeners(game) {
  const canvas = document.getElementById('game-canvas');
  const startBtn = document.getElementById('start-btn');
  const muteBtn = document.getElementById('mute-btn');

  // Clic sur le canvas ou le bouton pour démarrer/rejouer
  const handleStart = () => {
    if (game.state === GAME_STATE.MENU || game.state === GAME_STATE.GAME_OVER) {
      game.start();
      updateStartButton(game.state);
    }
  };

  canvas.addEventListener('click', handleStart);
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      console.log('[Piano Hero] Clic sur Start, état actuel:', game.state);
      if (game.state === GAME_STATE.PLAYING) {
        game.stop();
      } else {
        game.start();
      }
      console.log('[Piano Hero] Nouvel état:', game.state);
      updateStartButton(game.state);
    });
  }

  // Bouton muet
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      const muted = game.audio.toggleMute();
      muteBtn.textContent = muted ? 'SON: OFF' : 'SON: ON';
      muteBtn.classList.toggle('muted', muted);
    });
  }

  // Touche Espace pour pause
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (game.state === GAME_STATE.PLAYING || game.state === GAME_STATE.PAUSED) {
        game.togglePause();
      } else if (game.state === GAME_STATE.MENU || game.state === GAME_STATE.GAME_OVER) {
        game.start();
      }
      updateStartButton(game.state);
    }

    // Touche Échap pour revenir au menu
    if (e.code === 'Escape') {
      if (game.state === GAME_STATE.PLAYING || game.state === GAME_STATE.PAUSED) {
        game.stop();
        game.goToMenu();
        updateStartButton(game.state);
      }
    }
  });

  // Callback de changement d'état
  game.onStateChange = (state) => {
    updateStartButton(state);
    // Réinitialiser l'affichage des vies au démarrage
    if (state === GAME_STATE.PLAYING) {
      updateLivesDisplay(LIVES.INITIAL);
    }
  };

  // Callback de changement de score
  game.onScoreChange = (score) => {
    const scoreEl = document.querySelector('#score span');
    if (scoreEl) {
      scoreEl.textContent = score;
    }

    // Mettre à jour le high score si dépassé
    if (score > game.highScore) {
      const highScoreEl = document.querySelector('#high-score span');
      if (highScoreEl) {
        highScoreEl.textContent = score;
      }
    }
  };

  // Callback de changement de vies
  game.onLivesChange = (lives) => {
    updateLivesDisplay(lives);
  };

  // Callback de changement de niveau (level up)
  game.onLevelChange = (level) => {
    // Mettre à jour les boutons de niveau
    const container = document.getElementById('level-selector');
    if (container) {
      container.querySelectorAll('.level-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === level);
      });
    }

    // Mettre à jour l'affichage du nom de niveau
    const levelName = document.getElementById('level-name');
    if (levelName) {
      levelName.textContent = LEVELS[level].name;
    }
  };
}

/**
 * Met à jour l'affichage des vies
 * @param {number} lives - Nombre de vies restantes
 */
function updateLivesDisplay(lives) {
  const livesEl = document.querySelector('#lives span');
  if (livesEl) {
    let display = '';
    for (let i = 0; i < LIVES.MAX; i++) {
      display += i < lives ? '♥' : '♡';
    }
    livesEl.textContent = display;
  }
}

/**
 * Met à jour le texte du bouton de démarrage
 * @param {string} state - État du jeu
 */
function updateStartButton(state) {
  const startBtn = document.getElementById('start-btn');
  if (!startBtn) return;

  switch (state) {
    case GAME_STATE.MENU:
      startBtn.textContent = 'JOUER';
      startBtn.disabled = false;
      break;
    case GAME_STATE.PLAYING:
      startBtn.textContent = 'STOP';
      startBtn.disabled = false;
      break;
    case GAME_STATE.PAUSED:
      startBtn.textContent = 'REPRENDRE';
      startBtn.disabled = false;
      break;
    case GAME_STATE.GAME_OVER:
      startBtn.textContent = 'REJOUER';
      startBtn.disabled = false;
      break;
  }
}

/**
 * Crée les boutons de sélection de niveau
 * @param {Game} game - Instance du jeu
 */
function createLevelSelector(game) {
  const container = document.getElementById('level-selector');
  if (!container) return;

  // Vider le conteneur
  container.innerHTML = '';

  // Créer un bouton pour chaque niveau
  LEVELS.forEach((level, index) => {
    const btn = document.createElement('button');
    btn.className = 'level-btn' + (index === 0 ? ' active' : '');
    btn.textContent = (index + 1).toString();
    btn.title = level.name;

    btn.addEventListener('click', () => {
      if (game.state === GAME_STATE.PLAYING) return;

      game.setLevel(index);

      // Mettre à jour les boutons actifs
      container.querySelectorAll('.level-btn').forEach((b, i) => {
        b.classList.toggle('active', i === index);
      });

      // Mettre à jour l'affichage du nom de niveau
      const levelName = document.getElementById('level-name');
      if (levelName) {
        levelName.textContent = level.name;
      }
    });

    container.appendChild(btn);
  });

  // Afficher le nom du premier niveau
  const levelName = document.getElementById('level-name');
  if (levelName) {
    levelName.textContent = LEVELS[0].name;
  }
}

/**
 * Configure les modales (aide et leaderboard)
 */
function setupModals() {
  // Modal d'aide
  const helpModal = document.getElementById('help-modal');
  const helpOkBtn = document.getElementById('help-ok-btn');
  const helpBtn = document.getElementById('help-btn');
  const dontShowAgain = document.getElementById('dont-show-again');

  if (helpOkBtn) {
    helpOkBtn.addEventListener('click', () => {
      if (dontShowAgain && dontShowAgain.checked) {
        localStorage.setItem('piano-hero-help-seen', 'true');
      }
      hideHelpModal();
    });
  }

  if (helpBtn) {
    helpBtn.addEventListener('click', () => {
      showHelpModal();
    });
  }

  // Fermer avec Échap
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      hideHelpModal();
      hideLeaderboardModal();
    }
  });

  // Modal leaderboard
  const leaderboardModal = document.getElementById('leaderboard-modal');
  const leaderboardBtn = document.getElementById('leaderboard-btn');
  const leaderboardCloseBtn = document.getElementById('leaderboard-close-btn');

  if (leaderboardBtn) {
    leaderboardBtn.addEventListener('click', () => {
      showLeaderboardModal();
    });
  }

  if (leaderboardCloseBtn) {
    leaderboardCloseBtn.addEventListener('click', () => {
      hideLeaderboardModal();
    });
  }
}

/**
 * Affiche l'aide au premier lancement
 */
function showHelpIfFirstTime() {
  const helpSeen = localStorage.getItem('piano-hero-help-seen');
  if (!helpSeen) {
    showHelpModal();
  } else {
    hideHelpModal();
  }
}

/**
 * Affiche la modal d'aide
 */
function showHelpModal() {
  const helpModal = document.getElementById('help-modal');
  if (helpModal) {
    helpModal.style.display = 'flex';
    helpModal.classList.remove('hidden');
  }
}

/**
 * Cache la modal d'aide
 */
function hideHelpModal() {
  const helpModal = document.getElementById('help-modal');
  if (helpModal) {
    helpModal.style.display = 'none';
    helpModal.classList.add('hidden');
  }
}

/**
 * Affiche la modal leaderboard
 */
async function showLeaderboardModal() {
  const modal = document.getElementById('leaderboard-modal');
  const statusEl = document.querySelector('.leaderboard-status');

  if (modal) {
    modal.style.display = 'flex';
    modal.classList.remove('hidden');

    // Mettre à jour le statut
    if (statusEl) {
      statusEl.textContent = leaderboard.getStatus();
    }

    // Charger les scores
    const scores = await leaderboard.getTopScores(5);
    updateLeaderboardDisplay(scores);
  }
}

/**
 * Cache la modal leaderboard
 */
function hideLeaderboardModal() {
  const modal = document.getElementById('leaderboard-modal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.add('hidden');
  }
}

/**
 * Met à jour l'affichage du leaderboard
 * @param {Array} scores - Liste des scores
 */
function updateLeaderboardDisplay(scores) {
  const list = document.getElementById('leaderboard-list');
  if (!list) return;

  const entries = list.querySelectorAll('.leaderboard-entry');
  entries.forEach((entry, index) => {
    const nameEl = entry.querySelector('.name');
    const scoreEl = entry.querySelector('.lb-score');

    if (scores[index]) {
      nameEl.textContent = scores[index].player_name || '---';
      scoreEl.textContent = scores[index].score || 0;
    } else {
      nameEl.textContent = '---';
      scoreEl.textContent = '0';
    }
  });
}
