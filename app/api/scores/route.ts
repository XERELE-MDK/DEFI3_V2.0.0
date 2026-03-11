// ============================================================
// 🔌 API ROUTE — Scores
// Fichier : app/api/scores/route.ts
//
// Cette route gère la sauvegarde des parties
// et la récupération de l'historique d'un joueur.
//
// 📌 Endpoints disponibles :
//    POST /api/scores         → Sauvegarder une partie
//    GET  /api/scores?userId=1 → Historique d'un joueur
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { saveGame, getGamesByUser } from "@/lib/queries";

// ─────────────────────────────────────────────
// 📥 POST /api/scores
//
// Body attendu :
// {
//   "userId": 1,
//   "score": 5,
//   "timeSeconds": 12,
//   "clicksTotal": 7,
//   "difficulty": "hard",    ← nouveau
//   "objectsCount": 1        ← nouveau
// }
// ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, score, timeSeconds, clicksTotal, difficulty = "easy", objectsCount = 1 } = body;

    // Validation — champs obligatoires
    if (!userId || score === undefined || timeSeconds === undefined || clicksTotal === undefined) {
      return NextResponse.json(
        { error: "❌ Champs obligatoires manquants : userId, score, timeSeconds, clicksTotal" },
        { status: 400 }
      );
    }

    // Validation des types
    if (typeof userId !== "number" || typeof score !== "number" ||
        typeof timeSeconds !== "number" || typeof clicksTotal !== "number") {
      return NextResponse.json(
        { error: "❌ userId, score, timeSeconds, clicksTotal doivent être des nombres" },
        { status: 400 }
      );
    }

    // Validation difficulté
    if (!["easy", "medium", "hard"].includes(difficulty)) {
      return NextResponse.json(
        { error: "❌ difficulty doit être 'easy', 'medium' ou 'hard'" },
        { status: 400 }
      );
    }

    // Validation objectsCount
    if (typeof objectsCount !== "number" || objectsCount < 1 || objectsCount > 5) {
      return NextResponse.json(
        { error: "❌ objectsCount doit être entre 1 et 5" },
        { status: 400 }
      );
    }

    if (timeSeconds <= 0 || score < 0) {
      return NextResponse.json(
        { error: "❌ Le temps doit être positif et le score valide" },
        { status: 400 }
      );
    }

    // Sauvegarde avec les nouveaux champs
    const game = await saveGame(userId, score, timeSeconds, clicksTotal, difficulty, objectsCount);

    return NextResponse.json({ success: true, game }, { status: 201 });

  } catch (error) {
    console.error("❌ Erreur POST /api/scores :", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}


// ─────────────────────────────────────────────
// 📤 GET /api/scores?userId=1
//
// Retourne tout l'historique des parties
// d'un joueur spécifique
//
// Exemple d'appel :
// fetch("/api/scores?userId=1")
// ─────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    // 1️⃣ Récupération du paramètre userId dans l'URL
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");

    // 2️⃣ Validation — userId obligatoire
    if (!userIdParam) {
      return NextResponse.json(
        { error: "❌ Paramètre 'userId' manquant dans l'URL" },
        { status: 400 }
      );
    }

    // 3️⃣ Conversion string → number
    // Les paramètres d'URL sont toujours des strings !
    const userId = parseInt(userIdParam, 10);

    // Vérification que c'est bien un nombre valide
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "❌ 'userId' doit être un nombre entier" },
        { status: 400 }
      );
    }

    // 4️⃣ Récupération des parties en DB
    const games = await getGamesByUser(userId);

    // 5️⃣ Réponse avec la liste des parties
    return NextResponse.json({
      success: true,
      count: games.length,  // Nombre total de parties
      games,
    });

  } catch (error) {
    console.error("❌ Erreur GET /api/scores :", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
