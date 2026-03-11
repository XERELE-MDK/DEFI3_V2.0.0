// ============================================================
// 🛠️ FONCTIONS D'ACCÈS À LA BASE DE DONNÉES — v2
// Fichier : lib/queries.ts
// ============================================================

import { sql } from "./db";

// ─────────────────────────────────────────────
// 📦 TYPES TypeScript
// ─────────────────────────────────────────────
export type Difficulty = "easy" | "medium" | "hard";
export type Music      = "arcade" | "lofi" | "epic" | "none";
export type Theme      = "dark" | "retro" | "neon" | "pastel";

export type User = {
  id: number;
  username: string;
  theme: Theme;
  selected_icon: string;
  selected_music: Music;
  created_at: string;
};

export type Game = {
  id: number;
  user_id: number;
  score: number;
  time_seconds: number;
  clicks_total: number;
  difficulty: Difficulty;
  objects_count: number;
  created_at: string;
};

export type LeaderboardEntry = {
  username: string;
  selected_icon: string;
  difficulty: Difficulty;
  objects_count: number;
  total_games: number;
  best_time: number;
  best_score: number;
  last_played: string;
  rank_in_difficulty?: number;
};

// ─────────────────────────────────────────────
// 👤 UTILISATEURS
// ─────────────────────────────────────────────

/** Crée ou récupère un utilisateur par son pseudo */
export async function createOrGetUser(username: string): Promise<User> {
  const result = await sql`
    INSERT INTO users (username)
    VALUES (${username})
    ON CONFLICT (username)
    DO UPDATE SET username = EXCLUDED.username
    RETURNING *
  `;
  return result[0] as User;
}

/** Met à jour les préférences visuelles et sonores du joueur */
export async function updateUserPreferences(
  userId: number,
  preferences: { theme?: Theme; selected_icon?: string; selected_music?: Music }
): Promise<User> {
  const { theme, selected_icon, selected_music } = preferences;
  const result = await sql`
    UPDATE users SET
      theme          = COALESCE(${theme ?? null}, theme),
      selected_icon  = COALESCE(${selected_icon ?? null}, selected_icon),
      selected_music = COALESCE(${selected_music ?? null}, selected_music)
    WHERE id = ${userId}
    RETURNING *
  `;
  return result[0] as User;
}

/** Récupère un utilisateur par son pseudo */
export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE username = ${username} LIMIT 1
  `;
  return result.length > 0 ? (result[0] as User) : null;
}

// ─────────────────────────────────────────────
// 🎮 PARTIES
// ─────────────────────────────────────────────

/**
 * Sauvegarde une partie terminée
 * Nouveaux champs : difficulty + objects_count
 */
export async function saveGame(
  userId: number,
  score: number,
  timeSeconds: number,
  clicksTotal: number,
  difficulty: Difficulty = "easy",
  objectsCount: number = 1
): Promise<Game> {
  const result = await sql`
    INSERT INTO games (user_id, score, time_seconds, clicks_total, difficulty, objects_count)
    VALUES (${userId}, ${score}, ${timeSeconds}, ${clicksTotal}, ${difficulty}, ${objectsCount})
    RETURNING *
  `;
  return result[0] as Game;
}

/**
 * Historique des parties d'un joueur
 * Filtre optionnel par difficulté
 */
export async function getGamesByUser(
  userId: number,
  difficulty?: Difficulty
): Promise<Game[]> {
  if (difficulty) {
    const result = await sql`
      SELECT * FROM games
      WHERE user_id = ${userId} AND difficulty = ${difficulty}
      ORDER BY created_at DESC
    `;
    return result as Game[];
  }
  const result = await sql`
    SELECT * FROM games WHERE user_id = ${userId} ORDER BY created_at DESC
  `;
  return result as Game[];
}

// ─────────────────────────────────────────────
// 🏆 LEADERBOARD
// ─────────────────────────────────────────────

/** Classement global (toutes difficultés) */
export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const result = await sql`SELECT * FROM leaderboard LIMIT ${limit}`;
  return result as LeaderboardEntry[];
}

/** Classement filtré par difficulté avec rang calculé */
export async function getLeaderboardByDifficulty(
  difficulty: Difficulty,
  limit = 10
): Promise<LeaderboardEntry[]> {
  const result = await sql`
    SELECT * FROM leaderboard_by_difficulty
    WHERE difficulty = ${difficulty}
    LIMIT ${limit}
  `;
  return result as LeaderboardEntry[];
}
