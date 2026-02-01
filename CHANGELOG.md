# Changelog

Toutes les modifications notables du projet sont documentées ici.

## [Unreleased]

### Ajouté
- **Boomer Helper** : Modal d'aide au premier lancement expliquant les contrôles
  - Affichage des touches A S D F G H J
  - Checkbox "Ne plus afficher"
  - Bouton "?" pour réafficher l'aide
- **Leaderboard (placeholder)** : Système de classement prêt pour Supabase
  - Service `Leaderboard.js` avec fonctions CRUD
  - Modal d'affichage des scores
  - Désactivé par défaut (voir config.js pour activer)
- **Nouvelle mélodie "Souvenirs d'Hiver"** : Mélodie de fond nostalgique et chaleureuse
  - Inspirée de thèmes hivernaux avec une touche personnelle
  - Son plus doux avec onde triangle (au lieu de carrée)
  - Tempo légèrement ralenti pour une ambiance apaisante
- **Rotation d'images bonus** : Les notes bonus affichent maintenant des images aléatoires parmi 6 disponibles
  - `bonus_piano.png` (original)
  - `src/entities/bonus_pic/extracted_face_1.png`
  - `src/entities/bonus_pic/extracted_face_2.png`
  - `src/entities/bonus_pic/extracted_face_k1.png`
  - `src/entities/bonus_pic/extracted_face_k2.png`
  - `src/entities/bonus_pic/extracted_face_k3.png`

### Modifié
- **Résolution HD** : Passage de 320x240 à 640x480 natif (plus de flou)
  - Toutes les polices doublées pour HD
  - Éléments UI agrandis et repositionnés
  - Bordures plus épaisses (2-3px)
- **Touches mobiles améliorées** :
  - Taille augmentée (48x56px au lieu de 42x45px)
  - Police plus grande et en gras (16px)
  - Labels des touches toujours visibles sur mobile
- **Notes plus grandes** : Hauteur doublée (40px) pour meilleure visibilité

### Corrigé
- Flou sur certains écrans dû au scaling CSS
- Touches invisibles sur mobile (labels cachés)

## [1.0.0] - 2025-01-29

### Ajouté
- Système de vies (5 vies, -1 par note manquée)
- Level up automatique tous les 1500 points
- Affichage "GAME OVER" temporaire
- Affichage "LEVEL UP!" pendant 1 seconde
- Image bonus agrandie pour voir le visage

### Modifié
- Nouveau thème cyberpunk/neon orange (inspiré de witch_case)
- Palette de couleurs mise à jour
