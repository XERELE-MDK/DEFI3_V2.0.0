-- ============================================================
-- 🗄️ MIGRATION — Chasse au Logo v2
-- Fichier : lib/migration_v2.sql
--
-- ⚠️  CE FICHIER EST UNE MIGRATION
--     Il modifie les tables EXISTANTES sans perdre les données.
--
-- 📌 Comment l'utiliser ?
-- 1. Va sur https://console.neon.tech
-- 2. Ouvre ton projet → SQL Editor
-- 3. Copie-colle CE fichier et exécute-le UNE SEULE FOIS
--
-- ✅ Idempotent : peut être relu sans risque grâce aux
--    IF NOT EXISTS et IF EXISTS
-- ============================================================


-- ============================================================
-- 👤 MIGRATION TABLE : users
-- Ajout des préférences visuelles et sonores du joueur
-- ============================================================

-- Thème visuel choisi par le joueur
-- Valeurs possibles : 'dark' | 'retro' | 'neon' | 'pastel'
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'dark';

-- Icône / photo choisie par le joueur
-- On stocke le nom du fichier : 'rocket.png', 'star.png'...
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS selected_icon VARCHAR(100) DEFAULT 'target.png';

-- Musique préférée du joueur
-- Valeurs possibles : 'arcade' | 'lofi' | 'epic' | 'none'
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS selected_music VARCHAR(20) DEFAULT 'arcade';

-- Vérification : contrainte sur les valeurs autorisées pour le thème
-- Si la colonne de contrainte existe déjà on ne la recrée pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_theme_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_theme_check
      CHECK (theme IN ('dark', 'retro', 'neon', 'pastel'));
  END IF;
END $$;

-- Contrainte sur les valeurs de musique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_music_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_music_check
      CHECK (selected_music IN ('arcade', 'lofi', 'epic', 'none'));
  END IF;
END $$;


-- ============================================================
-- 🎮 MIGRATION TABLE : games
-- Ajout du niveau de difficulté et du nombre d'objets
-- ============================================================

-- Niveau de difficulté de la partie jouée
-- Valeurs : 'easy' | 'medium' | 'hard'
-- DEFAULT 'easy' → les anciennes parties existantes auront 'easy'
ALTER TABLE games
  ADD COLUMN IF NOT EXISTS difficulty VARCHAR(10) DEFAULT 'easy';

-- Nombre d'objets simultanés pendant la partie
-- DEFAULT 1 → les anciennes parties avaient 1 seul objet
ALTER TABLE games
  ADD COLUMN IF NOT EXISTS objects_count INTEGER DEFAULT 1;

-- Contrainte : difficulté doit être une valeur connue
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'games_difficulty_check'
  ) THEN
    ALTER TABLE games
      ADD CONSTRAINT games_difficulty_check
      CHECK (difficulty IN ('easy', 'medium', 'hard'));
  END IF;
END $$;

-- Contrainte : entre 1 et 5 objets simultanés maximum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'games_objects_check'
  ) THEN
    ALTER TABLE games
      ADD CONSTRAINT games_objects_check
      CHECK (objects_count BETWEEN 1 AND 5);
  END IF;
END $$;


-- ============================================================
-- 🏆 MISE À JOUR VUE : leaderboard
--
-- La vue est recréée pour inclure :
-- - Le filtre par niveau de difficulté
-- - L'icône du joueur (pour l'afficher dans le classement)
-- - Le nombre d'objets de la meilleure partie
--
-- CREATE OR REPLACE = mise à jour sans perte de données
-- ============================================================
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  u.username,
  u.selected_icon,                      -- Icône du joueur (photo)
  g.difficulty,                          -- Niveau de la partie
  g.objects_count,                       -- Nb d'objets de la meilleure partie
  COUNT(g.id)          AS total_games,   -- Nombre de parties jouées
  MIN(g.time_seconds)  AS best_time,     -- Meilleur temps (le plus bas)
  MAX(g.score)         AS best_score,    -- Meilleur score
  MAX(g.created_at)    AS last_played    -- Dernière partie
FROM users u
JOIN games g ON g.user_id = u.id
GROUP BY
  u.username,
  u.selected_icon,
  g.difficulty,
  g.objects_count
ORDER BY
  g.difficulty ASC,    -- Groupé par difficulté (easy → medium → hard)
  best_time ASC;       -- Puis trié par meilleur temps


-- ============================================================
-- 🏆 NOUVELLE VUE : leaderboard_by_difficulty
--
-- Vue spécialisée pour afficher le top 10 par niveau
-- Utilisée par /api/leaderboard?difficulty=hard
-- ============================================================
CREATE OR REPLACE VIEW leaderboard_by_difficulty AS
SELECT
  u.username,
  u.selected_icon,
  g.difficulty,
  MIN(g.time_seconds)  AS best_time,
  MAX(g.score)         AS best_score,
  COUNT(g.id)          AS total_games,
  MAX(g.created_at)    AS last_played,
  -- Rang calculé par fenêtre SQL (RANK) au sein de chaque difficulté
  RANK() OVER (
    PARTITION BY g.difficulty   -- Redémarre le rang pour chaque niveau
    ORDER BY MIN(g.time_seconds) ASC
  ) AS rank_in_difficulty
FROM users u
JOIN games g ON g.user_id = u.id
GROUP BY
  u.username,
  u.selected_icon,
  g.difficulty
ORDER BY
  g.difficulty ASC,
  best_time ASC;


-- ============================================================
-- 🔍 VÉRIFICATION FINALE
-- Ces requêtes permettent de vérifier que la migration
-- s'est bien déroulée
-- ============================================================

-- Vérifie les colonnes de la table users
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Vérifie les colonnes de la table games
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'games'
ORDER BY ordinal_position;
