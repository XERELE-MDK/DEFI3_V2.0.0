"use client";

// ============================================================
// 🎮 DÉFI 3 — À LA CHASSE AU LOGO ! v2
// Fichier : app/game/page.tsx
//
// 2 modes de jeu :
//   SOLO  (objects=1) → Attraper 5 fois, chrono le plus court
//   DUO   (objects=2) → Compte à rebours 30s, max de clics
//   TRIO  (objects=3) → Compte à rebours 30s, max de clics
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSound } from "@/hooks/use-sound";

// ─────────────────────────────────────────────
// 📐 CONSTANTES
// ─────────────────────────────────────────────
const DEFAULT_MOVE_INTERVAL = 1200;
const DEFAULT_LOGO_SIZE     = 80;
const SOLO_TARGET           = 5;    // Nb de clics pour gagner en mode SOLO
const DEFAULT_LOGO = { emoji: "🎯", color: "#facc15", shadow: "rgba(250,204,21,0.5)" };

// ─────────────────────────────────────────────
// 📦 TYPE — Un objet dans la zone de jeu
// Chaque objet a sa propre position (x, y) et un id unique
// ─────────────────────────────────────────────
type GameObj = { id: number; x: number; y: number };

// ─────────────────────────────────────────────
// 🎲 Position aléatoire pour un objet
// logoSize passé dynamiquement selon la difficulté
// ─────────────────────────────────────────────
function getRandomPosition(
  areaWidth: number,
  areaHeight: number,
  logoSize: number
): { x: number; y: number } {
  return {
    x: Math.random() * (areaWidth - logoSize),
    y: Math.random() * (areaHeight - logoSize),
  };
}

// ─────────────────────────────────────────────
// 🏆 Écran de victoire / fin de partie
//
// saveState :
//   "idle"   → formulaire pseudo
//   "saving" → spinner API
//   "saved"  → confirmation ✅
//   "error"  → erreur ❌
// ─────────────────────────────────────────────
function EndScreen({
  score, timer, emoji, clicksTotal, difficulty,
  mode, timeLimit, onRestart,
}: {
  score: number;
  timer: number;
  emoji: string;
  clicksTotal: number;
  difficulty: string;
  mode: string;
  timeLimit: number;
  onRestart: () => void;
}) {
  const [username, setUsername]   = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg]   = useState("");

  const diffColors: Record<string, string> = { easy: "#4ade80", medium: "#facc15", hard: "#f87171" };
  const diffLabels: Record<string, string> = { easy: "FACILE", medium: "MOYEN", hard: "DIFFICILE" };
  const modeColors: Record<string, string> = { solo: "#22d3ee", duo: "#a78bfa", trio: "#f97316" };

  const diffColor = diffColors[difficulty] || "#facc15";
  const modeColor = modeColors[mode] || "#22d3ee";
  const isSolo    = mode === "solo";

  // ── Sauvegarde du score
  const handleSave = async () => {
    const trimmed = username.trim();
    if (trimmed.length < 3) { setErrorMsg("Pseudo trop court (min 3 caractères)"); return; }
    if (trimmed.length > 20) { setErrorMsg("Pseudo trop long (max 20 caractères)"); return; }

    setSaveState("saving");
    setErrorMsg("");

    try {
      const userRes = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmed }),
      });
      if (!userRes.ok) throw new Error((await userRes.json()).error || "Erreur utilisateur");
      const { user } = await userRes.json();

      const objectsCount = mode === "solo" ? 1 : mode === "duo" ? 2 : 3;

      const scoreRes = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          score,
          timeSeconds: isSolo ? timer : timeLimit,
          clicksTotal,
          difficulty,
          objectsCount,
        }),
      });
      if (!scoreRes.ok) throw new Error((await scoreRes.json()).error || "Erreur score");

      setSaveState("saved");
    } catch (err: unknown) {
      setSaveState("error");
      setErrorMsg(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f172a] border-2 rounded-2xl px-8 py-8 text-center shadow-2xl max-w-md w-full mx-4"
        style={{ borderColor: isSolo ? "#facc15" : modeColor }}
      >
        {/* En-tête */}
        <div className="text-5xl mb-2">{emoji}</div>
        <h2 className="text-4xl font-black tracking-tight mb-2"
          style={{ color: isSolo ? "#facc15" : modeColor }}
        >
          {isSolo ? "VICTOIRE !" : "TEMPS ÉCOULÉ !"}
        </h2>

        {/* Badges mode + difficulté */}
        <div className="flex justify-center gap-2 mb-4">
          <span className="text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider"
            style={{ background: `${modeColor}22`, color: modeColor, border: `1px solid ${modeColor}44` }}
          >
            {mode.toUpperCase()}
          </span>
          <span className="text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider"
            style={{ background: `${diffColor}22`, color: diffColor, border: `1px solid ${diffColor}44` }}
          >
            {diffLabels[difficulty] || difficulty}
          </span>
        </div>

        {/* Résultat principal */}
        <div className="bg-slate-800 rounded-xl p-4 mb-5">
          {isSolo ? (
            // SOLO → afficher le temps
            <>
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Temps</p>
              <p className="text-5xl font-black text-yellow-300">{timer}s</p>
              <p className="text-slate-500 text-xs mt-1">{SOLO_TARGET} logos attrapés</p>
            </>
          ) : (
            // DUO/TRIO → afficher le score (nb de clics)
            <>
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Score</p>
              <p className="text-5xl font-black" style={{ color: modeColor }}>{score}</p>
              <p className="text-slate-500 text-xs mt-1">clics en {timeLimit}s</p>
            </>
          )}
        </div>

        {/* Formulaire / états de sauvegarde */}
        {saveState === "idle" && (
          <div className="space-y-3">
            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">
                Entre ton pseudo pour sauvegarder
              </p>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setErrorMsg(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder="Ton pseudo..."
                maxLength={20}
                className="w-full bg-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-center font-bold text-lg outline-none focus:ring-2 transition-all"
                style={{ focusRingColor: modeColor } as React.CSSProperties}
                autoFocus
              />
              <p className="text-slate-600 text-xs mt-1 text-right">{username.length}/20</p>
              {errorMsg && <p className="text-red-400 text-sm mt-2">{errorMsg}</p>}
            </div>
            <button
              onClick={handleSave}
              disabled={username.trim().length < 3}
              className="w-full py-3 font-black text-lg rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-black"
              style={{ background: username.trim().length >= 3 ? (isSolo ? "#facc15" : modeColor) : undefined }}
            >
              💾 SAUVEGARDER
            </button>
            <button onClick={onRestart} className="w-full py-2 text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Passer sans sauvegarder → Rejouer
            </button>
          </div>
        )}

        {saveState === "saving" && (
          <div className="py-8 space-y-4">
            <div className="w-12 h-12 mx-auto border-4 border-slate-600 border-t-yellow-400 rounded-full animate-spin" />
            <p className="text-slate-400">Sauvegarde en cours...</p>
          </div>
        )}

        {saveState === "saved" && (
          <div className="space-y-3">
            <div className="bg-green-900/30 border border-green-500/40 rounded-xl p-4">
              <p className="text-green-400 font-bold text-lg">✅ Score sauvegardé !</p>
              <p className="text-slate-400 text-sm mt-1">
                Bien joué <span className="text-white font-bold">{username}</span> ! Tu es dans le classement 🏆
              </p>
            </div>
            <Link href="/leaderboard"
              className="block w-full py-3 font-black text-lg rounded-xl transition-all hover:scale-105 active:scale-95 text-center text-black"
              style={{ background: isSolo ? "#facc15" : modeColor }}
            >
              🏆 VOIR LE CLASSEMENT
            </Link>
            <button onClick={onRestart} className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-black text-lg rounded-xl transition-all">
              🔄 REJOUER
            </button>
          </div>
        )}

        {saveState === "error" && (
          <div className="space-y-3">
            <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-4">
              <p className="text-red-400 font-bold">❌ Erreur de sauvegarde</p>
              <p className="text-slate-400 text-sm mt-1">{errorMsg}</p>
            </div>
            <button onClick={() => { setSaveState("idle"); setErrorMsg(""); }}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-lg rounded-xl transition-all"
            >
              🔄 RÉESSAYER
            </button>
            <button onClick={onRestart} className="w-full py-2 text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Rejouer sans sauvegarder
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 🎮 COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────
export default function GamePage() {

  // ── Paramètres d'URL
  const searchParams  = useSearchParams();
  const logo = {
    emoji:  searchParams.get("logo")   || DEFAULT_LOGO.emoji,
    color:  searchParams.get("color")  || DEFAULT_LOGO.color,
    shadow: searchParams.get("shadow") || DEFAULT_LOGO.shadow,
  };
  const difficulty   = searchParams.get("difficulty")   || "medium";
  const moveInterval = parseInt(searchParams.get("moveInterval") || String(DEFAULT_MOVE_INTERVAL));
  const logoSize     = parseInt(searchParams.get("logoSize")     || String(DEFAULT_LOGO_SIZE));
  const mode         = searchParams.get("mode")         || "solo";
  const objectsCount = parseInt(searchParams.get("objects")     || "1");
  const timeLimit    = parseInt(searchParams.get("timeLimit")   || "0");
  const music        = searchParams.get("music")        || "arcade";

  // Image PNG de l'icône choisie — avec fallback emoji
  const logoImage = searchParams.get("image") || "";

  // Hook audio — toute la logique son est ici
  const { startMusic, stopMusic, playClick, playVictory, toggleMute, isMuted } = useSound(music);

  // SOLO : objectsCount=1, timeLimit=0  → on compte les clics jusqu'à SOLO_TARGET
  // DUO/TRIO : objectsCount=2/3, timeLimit=30 → compte à rebours
  const isSolo = mode === "solo";

  // Badges visuels
  const diffColors: Record<string, string> = { easy: "#4ade80", medium: "#facc15", hard: "#f87171" };
  const diffLabels: Record<string, string> = { easy: "FACILE", medium: "MOYEN", hard: "DIFFICILE" };
  const modeColors: Record<string, string> = { solo: "#22d3ee", duo: "#a78bfa", trio: "#f97316" };
  const diffBadge  = { color: diffColors[difficulty] || "#facc15", label: diffLabels[difficulty] || "MOYEN" };
  const modeColor  = modeColors[mode] || "#22d3ee";

  // ── États du jeu
  // positions[] remplace l'ancienne position unique
  // Chaque objet a son propre id + coordonnées (x, y)
  const [objects, setObjects]         = useState<GameObj[]>([]);
  const [score, setScore]             = useState(0);
  const [timer, setTimer]             = useState(0);      // SOLO: chrono montant | DUO/TRIO: compte à rebours
  const [isPlaying, setIsPlaying]     = useState(false);
  const [hasEnded, setHasEnded]       = useState(false);
  const [clickedId, setClickedId]     = useState<number | null>(null); // Flash sur l'objet cliqué

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const nextId      = useRef(0); // Compteur d'id unique pour chaque objet

  // ── Génère une position aléatoire pour UN objet
  const randomPos = useCallback(() => {
    if (!gameAreaRef.current) return { x: 100, y: 100 };
    const { width, height } = gameAreaRef.current.getBoundingClientRect();
    return getRandomPosition(width, height, logoSize);
  }, [logoSize]);

  // ── Déplace UN objet spécifique (par son id) à une nouvelle position aléatoire
  const moveObject = useCallback((id: number) => {
    setObjects(prev =>
      prev.map(obj => obj.id === id ? { ...obj, ...randomPos() } : obj)
    );
  }, [randomPos]);

  // ── Déplace TOUS les objets en même temps
  const moveAllObjects = useCallback(() => {
    setObjects(prev =>
      prev.map(obj => ({ ...obj, ...randomPos() }))
    );
  }, [randomPos]);

  // ── Crée les objets initiaux selon le mode choisi
  const initObjects = useCallback(() => {
    const area = gameAreaRef.current;
    if (!area) return;
    const { width, height } = area.getBoundingClientRect();
    const newObjects: GameObj[] = Array.from({ length: objectsCount }, (_, i) => ({
      id: nextId.current++,
      ...getRandomPosition(width, height, logoSize),
    }));
    setObjects(newObjects);
  }, [objectsCount, logoSize]);

  // ── Déplacement automatique toutes les moveInterval ms
  useEffect(() => {
    if (!isPlaying || hasEnded) return;
    const id = setInterval(moveAllObjects, moveInterval);
    return () => clearInterval(id);
  }, [isPlaying, hasEnded, moveAllObjects, moveInterval]);

  // ── Chronomètre
  // SOLO     → monte (+1 chaque seconde)
  // DUO/TRIO → descend (part de timeLimit, va vers 0)
  useEffect(() => {
    if (!isPlaying || hasEnded) return;

    const id = setInterval(() => {
      setTimer(prev => {
        if (isSolo) {
          return prev + 1; // Chrono montant
        } else {
          const next = prev - 1;
          if (next <= 0) {
            // Temps écoulé → fin de partie
            setHasEnded(true);
            setIsPlaying(false);
            return 0;
          }
          return next;
        }
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isPlaying, hasEnded, isSolo]);

  // ── Clic sur un objet
  const handleObjectClick = (e: React.MouseEvent, objId: number) => {
    e.stopPropagation();
    if (!isPlaying || hasEnded) return;

    playClick(); // 👆 Son de clic à chaque objet attrapé

    setClickedId(objId);
    setTimeout(() => setClickedId(null), 250);
    moveObject(objId);

    const newScore = score + 1;
    setScore(newScore);

    if (isSolo && newScore >= SOLO_TARGET) {
      setHasEnded(true);
      setIsPlaying(false);
      stopMusic();   // ⏹️ Arrêt musique de fond
      playVictory(); // 🏆 Son de victoire
    }
  };

  // ── Fin de partie DUO/TRIO (quand timer atteint 0)
  useEffect(() => {
    if (hasEnded && !isSolo) {
      stopMusic();
      playVictory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasEnded]);

  // ── Démarrer / Recommencer
  const startGame = () => {
    setScore(0);
    setTimer(isSolo ? 0 : timeLimit);
    setHasEnded(false);
    setIsPlaying(true);
    nextId.current = 0;
    setTimeout(initObjects, 50);
    startMusic(); // ▶️ Démarre la musique de fond
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-white font-mono flex flex-col">

      {/* ── En-tête ── */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#1e293b] border-b border-slate-700 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-lg font-black tracking-widest text-yellow-400 uppercase">
            {logo.emoji} Chasse au Logo
          </h1>
          {/* Badge mode */}
          <span className="text-xs font-black px-2 py-1 rounded-full uppercase tracking-wider"
            style={{ background: `${modeColor}22`, color: modeColor, border: `1px solid ${modeColor}44` }}
          >
            {mode.toUpperCase()}
          </span>
          {/* Badge difficulté */}
          <span className="text-xs font-black px-2 py-1 rounded-full uppercase tracking-wider"
            style={{ background: `${diffBadge.color}22`, color: diffBadge.color, border: `1px solid ${diffBadge.color}44` }}
          >
            {diffBadge.label}
          </span>
        </div>

        <div className="flex gap-4 items-center">
          {/* Bouton mute — coupe tous les sons instantanément */}
          <button
            onClick={toggleMute}
            className="text-xl w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(100,116,139,0.3)" }}
            aria-label={isMuted ? "Activer le son" : "Couper le son"}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>

          {/* Score */}
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest">
              {isSolo ? "Clics" : "Score"}
            </p>
            <p className="text-2xl font-black text-white">
              {score}
              {isSolo && <span className="text-slate-500 text-sm">/{SOLO_TARGET}</span>}
            </p>
          </div>
          {/* Timer */}
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest">
              {isSolo ? "Temps" : "Restant"}
            </p>
            <p className={`text-2xl font-black ${
              !isSolo && timer <= 5 ? "text-red-400" :
              !isSolo && timer <= 10 ? "text-orange-400"
              : "text-cyan-400"
            }`}>
              {timer}s
            </p>
          </div>
        </div>
      </header>

      {/* ── Zone de jeu ── */}
      <div ref={gameAreaRef} className="relative flex-1 overflow-hidden cursor-crosshair" style={{ minHeight: "500px" }}>

        {/* Grille décorative */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        {/* ── Écran de départ ── */}
        {!isPlaying && !hasEnded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10 px-4">
            <div className="text-center space-y-2">
              {isSolo ? (
                <p className="text-slate-400 text-lg">
                  Attrape le logo <span className="text-yellow-400 font-bold">{SOLO_TARGET} fois</span>
                  <br />le plus vite possible !
                </p>
              ) : (
                <p className="text-slate-400 text-lg">
                  <span style={{ color: modeColor }} className="font-bold">{objectsCount} objets simultanés</span>
                  <br />Clique le maximum en{" "}
                  <span className="text-yellow-400 font-bold">{timeLimit} secondes</span> !
                </p>
              )}
            </div>
            <button
              onClick={startGame}
              className="px-10 py-4 text-black font-black text-xl rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-lg"
              style={{ background: logo.color, boxShadow: `0 0 30px ${logo.shadow}` }}
            >
              🚀 DÉMARRER
            </button>
          </div>
        )}

        {/* ── Les objets qui bougent ── */}
        {isPlaying && !hasEnded && objects.map((obj) => (
          <button
            key={obj.id}
            onClick={(e) => handleObjectClick(e, obj.id)}
            className="absolute z-20 flex items-center justify-center rounded-2xl hover:scale-110 active:scale-90 select-none overflow-hidden"
            style={{
              left: obj.x,
              top: obj.y,
              width: logoSize,
              height: logoSize,
              background: clickedId === obj.id ? "#4ade80" : logo.color,
              boxShadow: clickedId === obj.id
                ? "0 0 20px rgba(74,222,128,0.6)"
                : `0 0 20px ${logo.shadow}`,
              transform: clickedId === obj.id ? "scale(1.3)" : "scale(1)",
              transition: "left 0.3s ease-out, top 0.3s ease-out, transform 0.15s, background 0.15s",
            }}
          >
            {/* Image PNG si disponible, sinon emoji */}
            {logoImage ? (
              <Image
                src={logoImage}
                alt="logo"
                width={Math.round(logoSize * 0.65)}
                height={Math.round(logoSize * 0.65)}
                className="object-contain pointer-events-none"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <span style={{ fontSize: logoSize * 0.45 }}>{logo.emoji}</span>
            )}
          </button>
        ))}

        {/* ── Barre de progression ── */}
        {isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-700">
            <div
              className="h-full transition-all duration-300"
              style={{
                // SOLO → progression vers SOLO_TARGET
                // DUO/TRIO → décompte du temps restant
                width: isSolo
                  ? `${(score / SOLO_TARGET) * 100}%`
                  : `${(timer / timeLimit) * 100}%`,
                background: isSolo ? logo.color : modeColor,
              }}
            />
          </div>
        )}

        {/* Compte à rebours — alerte visuelle DUO/TRIO quand il reste peu de temps */}
        {isPlaying && !isSolo && timer <= 5 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
            <span className="text-red-400 font-black text-2xl animate-pulse">
              ⚠️ {timer}s !
            </span>
          </div>
        )}
      </div>

      {/* ── Écran de fin ── */}
      {hasEnded && (
        <EndScreen
          score={score}
          timer={timer}
          emoji={logo.emoji}
          clicksTotal={score}
          difficulty={difficulty}
          mode={mode}
          timeLimit={timeLimit}
          onRestart={startGame}
        />
      )}

    </main>
  );
}
