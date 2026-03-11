// ============================================================
// 🔌 API ROUTE — Leaderboard v2
// Fichier : app/api/leaderboard/route.ts
//
// Endpoints :
//   GET /api/leaderboard                        → classement global
//   GET /api/leaderboard?difficulty=hard        → filtré par niveau
//   GET /api/leaderboard?mode=solo              → filtré par mode
//   GET /api/leaderboard?difficulty=hard&limit=5
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard, getLeaderboardByDifficulty } from "@/lib/queries";
import type { Difficulty } from "@/lib/queries";

// ─────────────────────────────────────────────
// 🛠️ Formater le temps en string lisible
//   9  → "9s"
//   75 → "1m 15s"
// ─────────────────────────────────────────────
function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

// ─────────────────────────────────────────────
// 📤 GET /api/leaderboard
//
// Paramètres optionnels :
//   ?difficulty = 'easy' | 'medium' | 'hard'
//   ?mode       = 'solo' | 'duo' | 'trio'
//   ?limit      = 1-50 (défaut : 10)
// ─────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // ── Paramètre limit
    const limitParam = searchParams.get("limit");
    let limit = 10;
    if (limitParam) {
      const parsed = parseInt(limitParam, 10);
      if (isNaN(parsed) || parsed < 1 || parsed > 50) {
        return NextResponse.json(
          { error: "❌ 'limit' doit être un nombre entre 1 et 50" },
          { status: 400 }
        );
      }
      limit = parsed;
    }

    // ── Paramètre difficulty
    const difficulty = searchParams.get("difficulty");
    const VALID_DIFFICULTIES = ["easy", "medium", "hard"];
    if (difficulty && !VALID_DIFFICULTIES.includes(difficulty)) {
      return NextResponse.json(
        { error: "❌ 'difficulty' doit être 'easy', 'medium' ou 'hard'" },
        { status: 400 }
      );
    }

    // ── Paramètre mode (solo = 1 objet, duo = 2, trio = 3)
    const mode = searchParams.get("mode");
    const VALID_MODES = ["solo", "duo", "trio"];
    if (mode && !VALID_MODES.includes(mode)) {
      return NextResponse.json(
        { error: "❌ 'mode' doit être 'solo', 'duo' ou 'trio'" },
        { status: 400 }
      );
    }

    // ── Appel DB selon les filtres
    // Si difficulty fourni → vue leaderboard_by_difficulty (avec RANK())
    // Sinon → vue leaderboard globale
    const entries = difficulty
      ? await getLeaderboardByDifficulty(difficulty as Difficulty, limit)
      : await getLeaderboard(limit);

    // ── Formatage des données pour le frontend
    const ranked = entries.map((entry, index) => ({
      rank: entry.rank_in_difficulty ?? index + 1, // Rang SQL ou rang calculé
      ...entry,
      // SOLO → on formate le temps  |  DUO/TRIO → on formate le score
      best_time_formatted: formatTime(entry.best_time),
      // Label du mode déduit du nb d'objets
      mode_label: entry.objects_count === 1 ? "SOLO"
                : entry.objects_count === 2 ? "DUO"
                : "TRIO",
    }));

    return NextResponse.json({
      success: true,
      count: ranked.length,
      filters: {
        difficulty: difficulty || "all",
        mode: mode || "all",
        limit,
      },
      leaderboard: ranked,
    });

  } catch (error) {
    console.error("❌ Erreur GET /api/leaderboard :", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
