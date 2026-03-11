"use client";

// ============================================================
// 🏆 PAGE LEADERBOARD — v2
// Fichier : app/leaderboard/page.tsx
//
// Nouveautés v2 :
// - Onglets par difficulté : TOUS / FACILE / MOYEN / DIFFICILE
// - Badge mode de jeu (SOLO / DUO / TRIO) sur chaque ligne
// - Icône du joueur (image ou emoji fallback)
// - Colonne adaptée : temps (SOLO) ou score (DUO/TRIO)
// ============================================================

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// ─────────────────────────────────────────────
// 📦 TYPES
// ─────────────────────────────────────────────
type Difficulty = "all" | "easy" | "medium" | "hard";

type LeaderboardEntry = {
  rank: number;
  username: string;
  selected_icon: string;
  difficulty: string;
  objects_count: number;
  mode_label: string;
  best_time: number;
  best_time_formatted: string;
  best_score: number;
  total_games: number;
  last_played: string;
};

// ─────────────────────────────────────────────
// 📐 CONSTANTES — Onglets de difficulté
// ─────────────────────────────────────────────
const DIFFICULTY_TABS = [
  { key: "all",    label: "TOUS",      emoji: "🏆", color: "#facc15" },
  { key: "easy",   label: "FACILE",    emoji: "🟢", color: "#4ade80" },
  { key: "medium", label: "MOYEN",     emoji: "🟡", color: "#facc15" },
  { key: "hard",   label: "DIFFICILE", emoji: "🔴", color: "#f87171" },
];

const MODE_COLORS: Record<string, string> = {
  SOLO: "#22d3ee",
  DUO:  "#a78bfa",
  TRIO: "#f97316",
};

// ─────────────────────────────────────────────
// 🥇 Médaille selon le rang
// ─────────────────────────────────────────────
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return (
    <span className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-700 text-slate-300 font-bold text-xs">
      {rank}
    </span>
  );
}

// ─────────────────────────────────────────────
// ⏳ Skeleton de chargement
// ─────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 animate-pulse">
      <div className="w-7 h-7 rounded-full bg-slate-700 shrink-0" />
      <div className="w-8 h-8 rounded-lg bg-slate-700 shrink-0" />
      <div className="flex-1 h-4 rounded bg-slate-700" />
      <div className="w-14 h-4 rounded bg-slate-700" />
      <div className="w-14 h-4 rounded bg-slate-700" />
      <div className="w-10 h-4 rounded bg-slate-700" />
    </div>
  );
}

// ─────────────────────────────────────────────
// 🏆 COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────
export default function LeaderboardPage() {

  const [entries, setEntries]         = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [activeTab, setActiveTab]     = useState<Difficulty>("all"); // Onglet actif

  // ── Charger le leaderboard selon l'onglet actif
  const fetchLeaderboard = async (difficulty: Difficulty = activeTab) => {
    try {
      setIsLoading(true);
      setError(null);

      // Si "all" → pas de filtre | sinon → filtre par difficulté
      const url = difficulty === "all"
        ? "/api/leaderboard?limit=10"
        : `/api/leaderboard?difficulty=${difficulty}&limit=10`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Erreur HTTP : ${res.status}`);

      const data = await res.json();
      setEntries(data.leaderboard);
      setLastUpdated(new Date().toLocaleTimeString("fr-FR"));

    } catch (err) {
      console.error("❌ Erreur leaderboard :", err);
      setError("Impossible de charger le classement. Vérifie ta connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Chargement initial + auto-refresh 30s
  useEffect(() => {
    fetchLeaderboard();
    const id = setInterval(() => fetchLeaderboard(), 30000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Rechargement quand l'onglet change
  const handleTabChange = (tab: Difficulty) => {
    setActiveTab(tab);
    fetchLeaderboard(tab);
  };

  // ── Titre de la colonne principale selon les données
  // SOLO → on trie par temps | DUO/TRIO → on trie par score
  const hasOnlySolo = entries.every(e => e.objects_count === 1);
  const mainColLabel = activeTab === "all"
    ? "Meilleur" : hasOnlySolo ? "⏱ Temps" : "🎯 Score";

  return (
    <main className="min-h-screen bg-[#0f172a] text-white font-mono">

      {/* ── En-tête ── */}
      <header className="bg-[#1e293b] border-b border-slate-700 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-yellow-400 tracking-widest uppercase">
              🏆 Leaderboard
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Classement global · toutes difficultés
            </p>
          </div>
          <button
            onClick={() => fetchLeaderboard(activeTab)}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className={isLoading ? "animate-spin" : ""}>🔄</span>
            Actualiser
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* ── Onglets de difficulté ── */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {DIFFICULTY_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key as Difficulty)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 shrink-0"
              style={{
                background: activeTab === tab.key
                  ? `${tab.color}22`
                  : "rgba(30,41,59,0.8)",
                border: activeTab === tab.key
                  ? `2px solid ${tab.color}`
                  : "2px solid rgba(100,116,139,0.2)",
                color: activeTab === tab.key ? tab.color : "#64748b",
              }}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Erreur ── */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 mb-6 text-center">
            <p className="text-red-400">⚠️ {error}</p>
            <button
              onClick={() => fetchLeaderboard(activeTab)}
              className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg text-sm transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* ── Chargement ── */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {/* ── Données ── */}
        {!isLoading && !error && (
          <>
            {entries.length === 0 ? (
              // Aucune partie pour ce filtre
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🎮</p>
                <p className="text-slate-400 text-lg">
                  {activeTab === "all"
                    ? "Aucune partie jouée pour l'instant."
                    : `Aucune partie en difficulté ${activeTab}.`}
                </p>
                <Link
                  href="/"
                  className="inline-block mt-4 px-6 py-3 bg-yellow-400 text-black font-black rounded-xl hover:bg-yellow-300 transition-colors"
                >
                  Être le premier ! 🚀
                </Link>
              </div>
            ) : (
              <div className="space-y-2">

                {/* En-tête colonnes */}
                <div className="grid grid-cols-12 gap-2 px-3 pb-2 text-xs text-slate-500 uppercase tracking-widest">
                  <div className="col-span-1">#</div>
                  <div className="col-span-1"></div>
                  <div className="col-span-4">Joueur</div>
                  <div className="col-span-2 text-center">Mode</div>
                  <div className="col-span-2 text-center">{mainColLabel}</div>
                  <div className="col-span-2 text-center">Parties</div>
                </div>

                {/* Lignes */}
                {entries.map((entry) => {
                  const modeColor = MODE_COLORS[entry.mode_label] || "#facc15";
                  const isSolo    = entry.objects_count === 1;

                  return (
                    <div
                      key={`${entry.username}-${entry.difficulty}-${entry.objects_count}`}
                      className="grid grid-cols-12 gap-2 items-center px-3 py-3 rounded-xl border transition-all hover:scale-[1.01]"
                      style={{
                        background: entry.rank === 1 ? "rgba(250,204,21,0.08)"
                                  : entry.rank === 2 ? "rgba(148,163,184,0.08)"
                                  : entry.rank === 3 ? "rgba(251,146,60,0.08)"
                                  : "rgba(30,41,59,0.5)",
                        borderColor: entry.rank === 1 ? "rgba(250,204,21,0.3)"
                                   : entry.rank === 2 ? "rgba(148,163,184,0.2)"
                                   : entry.rank === 3 ? "rgba(251,146,60,0.2)"
                                   : "rgba(100,116,139,0.15)",
                      }}
                    >
                      {/* Rang */}
                      <div className="col-span-1 flex justify-center">
                        <RankBadge rank={entry.rank} />
                      </div>

                      {/* Icône joueur */}
                      <div className="col-span-1 flex justify-center">
                        {entry.selected_icon && entry.selected_icon !== "target.png" ? (
                          <Image
                            src={`/icons/${entry.selected_icon}`}
                            alt="icône"
                            width={28}
                            height={28}
                            className="object-contain rounded"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="text-lg">🎯</span>
                        )}
                      </div>

                      {/* Pseudo */}
                      <div className="col-span-4">
                        <p
                          className="font-bold truncate text-sm"
                          style={{
                            color: entry.rank === 1 ? "#facc15"
                                 : entry.rank === 2 ? "#cbd5e1"
                                 : entry.rank === 3 ? "#fb923c"
                                 : "#ffffff",
                          }}
                        >
                          {entry.username}
                        </p>
                        {/* Difficulté sous le pseudo */}
                        <p className="text-xs text-slate-500 mt-0.5">
                          {entry.difficulty}
                        </p>
                      </div>

                      {/* Badge mode SOLO / DUO / TRIO */}
                      <div className="col-span-2 flex justify-center">
                        <span
                          className="text-xs font-black px-2 py-0.5 rounded-full"
                          style={{
                            background: `${modeColor}22`,
                            color: modeColor,
                            border: `1px solid ${modeColor}44`,
                          }}
                        >
                          {entry.mode_label}
                        </span>
                      </div>

                      {/* Temps (SOLO) ou Score (DUO/TRIO) */}
                      <div className="col-span-2 text-center">
                        {isSolo ? (
                          <span className="text-cyan-400 font-black text-sm">
                            {entry.best_time_formatted}
                          </span>
                        ) : (
                          <span className="font-black text-sm" style={{ color: modeColor }}>
                            {entry.best_score} pts
                          </span>
                        )}
                      </div>

                      {/* Nb de parties */}
                      <div className="col-span-2 text-center">
                        <span className="text-slate-400 text-sm">
                          {entry.total_games}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dernière mise à jour */}
            {lastUpdated && (
              <p className="text-center text-slate-600 text-xs mt-6">
                Mis à jour à {lastUpdated} · Refresh auto toutes les 30s
              </p>
            )}
          </>
        )}

        {/* Bouton retour */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            🎯 Jouer
          </Link>
        </div>

      </div>
    </main>
  );
}
