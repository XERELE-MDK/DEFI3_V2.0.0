"use client";

// ============================================================
// 🏠 PAGE D'ACCUEIL — Chasse au Logo
// Fichier : app/page.tsx
//
// Design : Arcade rétro-futuriste sombre
// Animations : CSS keyframes via style inline
// Liens : /game (jouer) et /leaderboard (classement)
//
// ⚠️ IMPORTANT : Ajouter dans app/layout.tsx dans le <head> :
// <link href="https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
// ============================================================

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// Polices définies comme constantes pour éviter la répétition
const FONT_ARCADE = "'Black Ops One', cursive";
const FONT_MONO   = "'Share Tech Mono', monospace";

// ─────────────────────────────────────────────
// 🎨 LISTE DES LOGOS DISPONIBLES
// Chaque logo a un emoji, un nom et une couleur d'accent
// Pour en ajouter : copie un objet et change les valeurs
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// 🖼️ LOGOS — icônes du jeu
// emoji    : fallback si l'image ne charge pas
// image    : chemin dans /public/icons/
// name     : nom affiché sous le sélecteur
// color    : couleur d'accent du logo
// shadow   : ombre colorée autour du logo
//
// 📌 Dépose tes fichiers dans : public/icons/
// ─────────────────────────────────────────────
const LOGOS = [
  { emoji: "🎯", image: "/icons/target.png",  name: "Cible",   color: "#facc15", shadow: "rgba(250,204,21,0.5)"  },
  { emoji: "🚀", image: "/icons/rocket.png",  name: "Fusée",   color: "#22d3ee", shadow: "rgba(34,211,238,0.5)"  },
  { emoji: "⭐", image: "/icons/star.png",    name: "Étoile",  color: "#a78bfa", shadow: "rgba(167,139,250,0.5)" },
  { emoji: "🔥", image: "/icons/fire.png",    name: "Feu",     color: "#f97316", shadow: "rgba(249,115,22,0.5)"  },
  { emoji: "💎", image: "/icons/diamond.png", name: "Diamant", color: "#34d399", shadow: "rgba(52,211,153,0.5)"  },
];

// ─────────────────────────────────────────────
// 🎵 MUSIQUES DISPONIBLES
// key         : identifiant passé dans l'URL
// label       : nom affiché
// emoji       : icône visuelle
// color       : couleur d'accent
// description : ambiance de la musique
//
// 📌 Dépose tes fichiers dans : public/sounds/
//    → arcade.mp3 / lofi.mp3 / epic.mp3
// ─────────────────────────────────────────────
const MUSIC_TRACKS = [
  {
    key:         "arcade",
    label:       "ARCADE",
    emoji:       "🎮",
    color:       "#facc15",
    border:      "rgba(250,204,21,0.4)",
    shadow:      "rgba(250,204,21,0.3)",
    description: "Rétro & fun",
  },
  {
    key:         "lofi",
    label:       "LO-FI",
    emoji:       "🎵",
    color:       "#22d3ee",
    border:      "rgba(34,211,238,0.4)",
    shadow:      "rgba(34,211,238,0.3)",
    description: "Chill & focus",
  },
  {
    key:         "epic",
    label:       "EPIC",
    emoji:       "⚔️",
    color:       "#f87171",
    border:      "rgba(248,113,113,0.4)",
    shadow:      "rgba(248,113,113,0.3)",
    description: "Intense & rapide",
  },
];

// ─────────────────────────────────────────────
// 🎮 NIVEAUX DE DIFFICULTÉ
// Chaque niveau définit :
//   - label      : nom affiché
//   - emoji      : icône visuelle
//   - color      : couleur d'accent
//   - description: ce qui change pour le joueur
//   - moveInterval: vitesse de déplacement (ms) — plus bas = plus rapide
//   - logoSize   : taille du logo (px) — plus petit = plus dur à cliquer
// ─────────────────────────────────────────────
const DIFFICULTIES = [
  {
    key:          "easy",
    label:        "FACILE",
    emoji:        "🟢",
    color:        "#4ade80",
    border:       "rgba(74,222,128,0.4)",
    shadow:       "rgba(74,222,128,0.3)",
    description:  "Logo lent et grand",
    moveInterval: 1800,   // 1.8s entre chaque déplacement
    logoSize:     90,     // Grand logo facile à cliquer
  },
  {
    key:          "medium",
    label:        "MOYEN",
    emoji:        "🟡",
    color:        "#facc15",
    border:       "rgba(250,204,21,0.4)",
    shadow:       "rgba(250,204,21,0.3)",
    description:  "Logo normal",
    moveInterval: 1200,   // 1.2s — valeur par défaut originale
    logoSize:     80,     // Taille standard
  },
  {
    key:          "hard",
    label:        "DIFFICILE",
    emoji:        "🔴",
    color:        "#f87171",
    border:       "rgba(248,113,113,0.4)",
    shadow:       "rgba(248,113,113,0.3)",
    description:  "Logo rapide et petit",
    moveInterval: 700,    // 0.7s — très rapide !
    logoSize:     60,     // Petit logo difficile à cliquer
  },
];

// ─────────────────────────────────────────────
// 🕹️ MODES DE JEU
// Définit le nombre d'objets simultanés et la règle de victoire
//
// SOLO  → 1 objet  → Chrono : faire le temps le plus COURT (5 clics)
// DUO   → 2 objets → Compte à rebours 30s : max de clics
// TRIO  → 3 objets → Compte à rebours 30s : max de clics
// ─────────────────────────────────────────────
const GAME_MODES = [
  {
    key:         "solo",
    label:       "SOLO",
    objects:     1,
    color:       "#22d3ee",
    border:      "rgba(34,211,238,0.4)",
    shadow:      "rgba(34,211,238,0.3)",
    emoji:       "🎯",
    rule:        "Temps le plus court",
    description: "5 clics · chrono",
    timeLimit:   null,   // Pas de limite — on bat le chrono
  },
  {
    key:         "duo",
    label:       "DUO",
    objects:     2,
    color:       "#a78bfa",
    border:      "rgba(167,139,250,0.4)",
    shadow:      "rgba(167,139,250,0.3)",
    emoji:       "🎯🎯",
    rule:        "Max de clics en 30s",
    description: "2 objets · 30s",
    timeLimit:   30,    // 30 secondes
  },
  {
    key:         "trio",
    label:       "TRIO",
    objects:     3,
    color:       "#f97316",
    border:      "rgba(249,115,22,0.4)",
    shadow:      "rgba(249,115,22,0.3)",
    emoji:       "🎯🎯🎯",
    rule:        "Max de clics en 30s",
    description: "3 objets · 30s",
    timeLimit:   30,
  },
];


// Petits points lumineux animés en arrière-plan
// Chaque particule a une position et vitesse aléatoire
// ─────────────────────────────────────────────
function Particle({ index }: { index: number }) {
  // On utilise index pour varier les propriétés
  const size = [4, 6, 3, 5, 4][index % 5];
  const left = (index * 17 + 5) % 95;
  const delay = (index * 0.7) % 4;
  const duration = 3 + (index % 4);

  return (
    <div
      className="absolute rounded-full opacity-60"
      style={{
        width: size,
        height: size,
        left: `${left}%`,
        bottom: "-10px",
        background: index % 3 === 0 ? "#facc15" : index % 3 === 1 ? "#22d3ee" : "#f472b6",
        animation: `floatUp ${duration}s ${delay}s infinite ease-in`,
      }}
    />
  );
}

// ─────────────────────────────────────────────
// 📊 COMPOSANT — Stat Card
// Affiche une statistique clé sur la page d'accueil
// ─────────────────────────────────────────────
function StatCard({
  value,
  label,
  color,
  delay,
}: {
  value: string;
  label: string;
  color: string;
  delay: string;
}) {
  return (
    <div
      className="text-center px-6 py-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm"
      style={{ animation: `fadeSlideUp 0.6s ${delay} both`, fontFamily: FONT_MONO }}
    >
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// 🏠 COMPOSANT PRINCIPAL — Page d'accueil
// ─────────────────────────────────────────────
export default function HomePage() {
  // État pour l'effet de "glitch" sur le titre
  const [glitch, setGlitch] = useState(false);

  // ── Musique sélectionnée (arcade par défaut)
  const [selectedMusicIndex, setSelectedMusicIndex] = useState(0);
  const selectedMusic = MUSIC_TRACKS[selectedMusicIndex];

  // ── Mode de jeu sélectionné (SOLO par défaut)
  const [selectedModeIndex, setSelectedModeIndex] = useState(0);
  const selectedMode = GAME_MODES[selectedModeIndex];

  // ── Logo sélectionné par le joueur (index dans LOGOS)
  // Par défaut : le premier logo (🎯)
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedLogo = LOGOS[selectedIndex];

  // ── Difficulté sélectionnée par le joueur
  // Par défaut : "medium" (index 1)
  const [selectedDiffIndex, setSelectedDiffIndex] = useState(1);
  const selectedDiff = DIFFICULTIES[selectedDiffIndex];

  // ── Effet glitch automatique toutes les 4 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* ── Styles CSS globaux (keyframes) ── */}
      {/* ⚠️ Le @import Google Fonts doit être dans app/layout.tsx */}
      <style>{`
        /* Animation : particules qui montent */
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1); opacity: 0.6; }
          80%  { opacity: 0.4; }
          100% { transform: translateY(-100vh) scale(0.3); opacity: 0; }
        }

        /* Animation : entrée par le bas */
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Animation : pulsation du logo cible */
        @keyframes targetPulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25%      { transform: scale(1.15) rotate(-5deg); }
          75%      { transform: scale(0.95) rotate(5deg); }
        }

        /* Animation : scanline rétro */
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        /* Animation : clignotement du curseur */
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        /* Animation : glitch du titre */
        @keyframes glitchShift {
          0%   { clip-path: inset(0 0 90% 0); transform: translate(-4px, 0); }
          25%  { clip-path: inset(40% 0 50% 0); transform: translate(4px, 0); }
          50%  { clip-path: inset(70% 0 10% 0); transform: translate(-2px, 0); }
          100% { clip-path: inset(0 0 0 0); transform: translate(0); }
        }

        /* Animation : bordure lumineuse bouton */
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(250,204,21,0.3), inset 0 0 20px rgba(250,204,21,0.05); }
          50%       { box-shadow: 0 0 40px rgba(250,204,21,0.6), inset 0 0 30px rgba(250,204,21,0.1); }
        }

        /* Effet glitch — pseudo-éléments sur le wrapper du titre */
        .glitch-active {
          position: relative;
        }
        .glitch-active::before {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          color: #22d3ee;
          animation: glitchShift 0.4s steps(2) forwards;
          pointer-events: none;
        }
        .glitch-active::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          color: #f472b6;
          animation: glitchShift 0.4s steps(2) 0.05s forwards;
          opacity: 0.7;
          pointer-events: none;
        }

        /* Bouton CTA animé */
        .btn-play {
          animation: borderGlow 2s ease-in-out infinite;
          transition: transform 0.2s;
        }
        .btn-play:hover  { transform: scale(1.05) translateY(-2px); }
        .btn-play:active { transform: scale(0.97); }
      `}</style>

      <main
        className="min-h-screen bg-[#060d1a] text-white overflow-hidden relative flex flex-col"
        style={{ fontFamily: "'Share Tech Mono', monospace" }}
      >

        {/* ── Grille de fond rétro ─────────── */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(250,204,21,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(250,204,21,0.8) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* ── Scanline rétro ──────────────── */}
        <div
          className="absolute inset-x-0 h-32 pointer-events-none z-10 opacity-[0.03]"
          style={{
            background: "linear-gradient(transparent, rgba(250,204,21,0.5), transparent)",
            animation: "scanline 6s linear infinite",
          }}
        />

        {/* ── Particules flottantes ────────── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 18 }).map((_, i) => (
            <Particle key={i} index={i} />
          ))}
        </div>

        {/* ── Lueur centrale ──────────────── */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width: "600px",
            height: "400px",
            background: "radial-gradient(ellipse, rgba(250,204,21,0.06) 0%, transparent 70%)",
          }}
        />

        {/* ══════════════════════════════════
            CONTENU PRINCIPAL
        ══════════════════════════════════ */}
        <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 text-center">

          {/* ── Badge "NEW GAME" ─────────── */}
          <div
            className="mb-6"
            style={{ animation: "fadeSlideUp 0.5s 0.1s both", fontFamily: FONT_MONO }}
          >
            <span className="px-4 py-1.5 bg-yellow-400/10 border border-yellow-400/40 rounded-full text-yellow-400 text-xs uppercase tracking-[0.3em]">
              ● INSERT COIN TO PLAY
            </span>
          </div>

          {/* ── Titre principal avec effet glitch ──
              Un seul wrapper .glitch-active pour les deux lignes
              data-text = texte complet pour les pseudo-éléments
          ── */}
          <div
            className={`mb-8 relative select-none ${glitch ? "glitch-active" : ""}`}
            data-text="CHASSE AU LOGO !"
            style={{ animation: "fadeSlideUp 0.5s 0.2s both" }}
          >
            {/* Ligne 1 — h1 unique de la page */}
            <h1
              className="text-6xl md:text-8xl tracking-tight"
              style={{ fontFamily: FONT_ARCADE, lineHeight: 1, color: "#ffffff" }}
            >
              CHASSE AU
            </h1>

            {/* Ligne 2 — h2 pour respecter la hiérarchie SEO */}
            <h2
              className="text-6xl md:text-8xl tracking-tight"
              style={{
                fontFamily: FONT_ARCADE,
                lineHeight: 1,
                WebkitTextStroke: "2px #facc15",
                color: "transparent",
                textShadow: "0 0 40px rgba(250,204,21,0.4)",
              }}
            >
              LOGO !
            </h2>
          </div>

          {/* ── Logo animé (préview du logo choisi) ── */}
          <div
            className="mb-6"
            style={{ animation: "fadeSlideUp 0.5s 0.35s both" }}
          >
            <div
              className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300"
              style={{
                background: selectedLogo.color,
                animation: "targetPulse 2s ease-in-out infinite",
                boxShadow: `0 0 30px ${selectedLogo.shadow}, 0 0 60px ${selectedLogo.shadow}`,
              }}
            >
              {/* Le logo change en temps réel selon la sélection */}
              <span className="text-5xl">{selectedLogo.emoji}</span>
            </div>
            <p
              className="text-xs mt-2 uppercase tracking-widest"
              style={{ color: selectedLogo.color, fontFamily: FONT_MONO }}
            >
              {selectedLogo.name}
            </p>
          </div>

          {/* ── Sélecteur de MODE DE JEU ────────
              ÉTAPE 1 — Affiché EN PREMIER
              SOLO / DUO / TRIO
          ── */}
          <div
            className="w-full max-w-sm mb-6"
            style={{ animation: "fadeSlideUp 0.5s 0.38s both" }}
          >
            <p
              className="text-slate-500 text-xs uppercase tracking-widest mb-3 text-center"
              style={{ fontFamily: FONT_MONO }}
            >
              ① Mode de jeu
            </p>
            <div className="grid grid-cols-3 gap-2">
              {GAME_MODES.map((mode, index) => (
                <button
                  key={mode.key}
                  onClick={() => setSelectedModeIndex(index)}
                  className="relative flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    background: selectedModeIndex === index
                      ? `${mode.color}18`
                      : "rgba(30,41,59,0.8)",
                    border: selectedModeIndex === index
                      ? `2px solid ${mode.border}`
                      : "2px solid rgba(100,116,139,0.2)",
                    boxShadow: selectedModeIndex === index
                      ? `0 0 14px ${mode.shadow}`
                      : "none",
                  }}
                >
                  {/* Emojis objets */}
                  <span className="text-base tracking-tighter">{mode.emoji}</span>

                  {/* Nom du mode */}
                  <span
                    className="text-xs font-black tracking-wider"
                    style={{
                      fontFamily: FONT_MONO,
                      color: selectedModeIndex === index ? mode.color : "#64748b",
                    }}
                  >
                    {mode.label}
                  </span>

                  {/* Règle courte */}
                  <span
                    className="leading-tight text-center"
                    style={{ fontFamily: FONT_MONO, color: "#475569", fontSize: "9px" }}
                  >
                    {mode.description}
                  </span>

                  {/* Point sélection */}
                  {selectedModeIndex === index && (
                    <span
                      className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                      style={{ background: mode.color }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Règle du mode sélectionné — ligne d'explication */}
            <p
              className="text-center text-xs mt-2"
              style={{ fontFamily: FONT_MONO, color: selectedMode.color }}
            >
              {selectedMode.rule}
            </p>
          </div>

          {/* ── Sélecteur de logos ② ────────────
              Images PNG depuis /public/icons/
              Fallback emoji si image non trouvée
          ── */}
          <div
            className="flex gap-3 mb-6"
            style={{ animation: "fadeSlideUp 0.5s 0.42s both" }}
          >
            {LOGOS.map((logo, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                aria-label={`Choisir le logo ${logo.name}`}
                className="relative w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 overflow-hidden"
                style={{
                  background: selectedIndex === index
                    ? `${logo.color}22`
                    : "rgba(30,41,59,0.8)",
                  border: selectedIndex === index
                    ? `2px solid ${logo.color}`
                    : "2px solid rgba(100,116,139,0.3)",
                  boxShadow: selectedIndex === index
                    ? `0 0 12px ${logo.shadow}`
                    : "none",
                }}
              >
                {/* Image PNG — avec fallback emoji si absente */}
                <Image
                  src={logo.image}
                  alt={logo.name}
                  width={36}
                  height={36}
                  className="object-contain"
                  onError={(e) => {
                    // Si l'image ne charge pas → on affiche l'emoji
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextSibling as HTMLElement;
                    if (fallback) fallback.style.display = "block";
                  }}
                />
                {/* Emoji fallback — caché par défaut */}
                <span className="text-2xl hidden absolute">{logo.emoji}</span>

                {/* Point indicateur si sélectionné */}
                {selectedIndex === index && (
                  <span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ background: logo.color }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── Sélecteur de difficulté ③ ── */}
          <div
            className="w-full max-w-sm mb-6"
            style={{ animation: "fadeSlideUp 0.5s 0.47s both" }}
          >
            <p
              className="text-slate-500 text-xs uppercase tracking-widest mb-3 text-center"
              style={{ fontFamily: FONT_MONO }}
            >
              ③ Difficulté
            </p>

            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((diff, index) => (
                <button
                  key={diff.key}
                  onClick={() => setSelectedDiffIndex(index)}
                  className="relative flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    background: selectedDiffIndex === index
                      ? `${diff.color}18`
                      : "rgba(30,41,59,0.8)",
                    border: selectedDiffIndex === index
                      ? `2px solid ${diff.border}`
                      : "2px solid rgba(100,116,139,0.2)",
                    boxShadow: selectedDiffIndex === index
                      ? `0 0 14px ${diff.shadow}`
                      : "none",
                  }}
                >
                  <span className="text-lg">{diff.emoji}</span>
                  <span
                    className="text-xs font-black tracking-wider"
                    style={{
                      fontFamily: FONT_MONO,
                      color: selectedDiffIndex === index ? diff.color : "#64748b",
                    }}
                  >
                    {diff.label}
                  </span>
                  <span
                    className="text-xs leading-tight text-center"
                    style={{ fontFamily: FONT_MONO, color: "#475569", fontSize: "9px" }}
                  >
                    {diff.description}
                  </span>
                  {selectedDiffIndex === index && (
                    <span
                      className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                      style={{ background: diff.color }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Description dynamique ─────────── */}
          <p
            className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed text-center"
            style={{ animation: "fadeSlideUp 0.5s 0.4s both", fontFamily: FONT_MONO }}
          >
            {selectedMode.key === "solo" ? (
              <>
                <span className="text-cyan-400">1 objet</span> — Attrape-le{" "}
                <span className="text-yellow-400 font-bold">5 fois</span> le plus vite possible.
                <br />Bats le record. Prends la 1ère place.
              </>
            ) : (
              <>
                <span style={{ color: selectedMode.color }}>{selectedMode.objects} objets simultanés</span>{" "}
                — Tu as <span className="text-yellow-400 font-bold">30 secondes</span>.
                <br />Clique le maximum. Bats le score record.
              </>
            )}
            <span
              className="inline-block w-2 h-4 bg-yellow-400 ml-1 align-middle"
              style={{ animation: "blink 1s step-end infinite" }}
            />
          </p>

          {/* ── Sélecteur de musique ④ ──────────
              3 ambiances : Arcade / Lo-Fi / Epic
              Passée dans l'URL → lue par game-page.tsx
          ── */}
          <div
            className="w-full max-w-sm mb-8"
            style={{ animation: "fadeSlideUp 0.5s 0.50s both" }}
          >
            <p
              className="text-slate-500 text-xs uppercase tracking-widest mb-3 text-center"
              style={{ fontFamily: FONT_MONO }}
            >
              ④ Musique
            </p>
            <div className="grid grid-cols-3 gap-2">
              {MUSIC_TRACKS.map((track, index) => (
                <button
                  key={track.key}
                  onClick={() => setSelectedMusicIndex(index)}
                  className="relative flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    background: selectedMusicIndex === index
                      ? `${track.color}18`
                      : "rgba(30,41,59,0.8)",
                    border: selectedMusicIndex === index
                      ? `2px solid ${track.border}`
                      : "2px solid rgba(100,116,139,0.2)",
                    boxShadow: selectedMusicIndex === index
                      ? `0 0 14px ${track.shadow}`
                      : "none",
                  }}
                >
                  <span className="text-lg">{track.emoji}</span>
                  <span
                    className="text-xs font-black tracking-wider"
                    style={{
                      fontFamily: FONT_MONO,
                      color: selectedMusicIndex === index ? track.color : "#64748b",
                    }}
                  >
                    {track.label}
                  </span>
                  <span
                    className="leading-tight text-center"
                    style={{ fontFamily: FONT_MONO, color: "#475569", fontSize: "9px" }}
                  >
                    {track.description}
                  </span>
                  {selectedMusicIndex === index && (
                    <span
                      className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                      style={{ background: track.color }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Boutons CTA ─────────────── */}
          <div
            className="flex flex-col sm:flex-row gap-4 mb-14"
            style={{ animation: "fadeSlideUp 0.5s 0.5s both" }}
          >
            {/* Bouton JOUER — passe mode + logo + difficulté dans l'URL */}
            <Link
              href={`/game?logo=${encodeURIComponent(selectedLogo.emoji)}&image=${encodeURIComponent(selectedLogo.image)}&color=${encodeURIComponent(selectedLogo.color)}&shadow=${encodeURIComponent(selectedLogo.shadow)}&difficulty=${selectedDiff.key}&moveInterval=${selectedDiff.moveInterval}&logoSize=${selectedDiff.logoSize}&mode=${selectedMode.key}&objects=${selectedMode.objects}&timeLimit=${selectedMode.timeLimit ?? 0}&music=${selectedMusic.key}`}
              className="btn-play font-arcade text-xl px-10 py-4 rounded-2xl tracking-wider text-black"
              style={{ background: selectedLogo.color }}
            >
              ▶ JOUER
            </Link>

            <Link
              href="/leaderboard"
              className="font-arcade text-xl px-10 py-4 bg-transparent border-2 border-slate-600 hover:border-yellow-400/60 text-slate-300 hover:text-yellow-400 rounded-2xl transition-all duration-200 tracking-wider hover:scale-105"
            >
              🏆 CLASSEMENT
            </Link>
          </div>

          {/* ── Stats rapides ───────────── */}
          <div
            className="grid grid-cols-3 gap-4 max-w-sm w-full"
            style={{ animation: "fadeSlideUp 0.5s 0.6s both" }}
          >
            <StatCard value={selectedMode.key === "solo" ? "5" : "30s"} label={selectedMode.key === "solo" ? "Clics" : "Chrono"} color="text-yellow-400" delay="0.65s" />
            <StatCard value={String(selectedMode.objects)} label="Objets" color="text-cyan-400" delay="0.7s" />
            <StatCard value="#1" label="Objectif" color="text-pink-400" delay="0.75s" />
          </div>

        </div>

        {/* ── Footer ──────────────────────── */}
        <footer
          className="relative z-20 text-center pb-6 text-slate-700 text-xs"
          style={{ animation: "fadeSlideUp 0.5s 0.8s both", fontFamily: FONT_MONO }}
        >
          NEXT.JS · TAILWIND · NEONDB · WINDSURF
        </footer>

      </main>
    </>
  );
}
