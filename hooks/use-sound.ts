// ============================================================
// 🎵 HOOK CUSTOM — useSound
// Fichier : hooks/use-sound.ts
//
// Centralise toute la logique audio Howler.js
//
// Utilisation dans game-page.tsx :
//   const { playClick, playVictory, toggleMute, isMuted, startMusic, stopMusic } = useSound(music)
// ============================================================

import { useRef, useState, useEffect, useCallback } from "react";
import { Howl, Howler } from "howler";

// ─────────────────────────────────────────────
// 📐 CONFIG — Volumes par type de son
// ─────────────────────────────────────────────
const VOLUME_BG      = 0.35; // Musique de fond (discret)
const VOLUME_CLICK   = 0.6;  // Son de clic (bien audible)
const VOLUME_VICTORY = 0.8;  // Son de victoire (fort et clair)

export function useSound(music: string) {
  // ── Références Howl — ne se recréent pas au re-render
  const bgRef      = useRef<Howl | null>(null);
  const clickRef   = useRef<Howl | null>(null);
  const victoryRef = useRef<Howl | null>(null);

  // ── État mute global (affiché dans le header)
  const [isMuted, setIsMuted] = useState(false);

  // ─────────────────────────────────────────
  // 🔧 Initialisation des sons
  // Créé UNE seule fois au montage ou quand
  // la musique choisie change
  // ─────────────────────────────────────────
  useEffect(() => {
    // Son de clic — court, joué à chaque objet attrapé
    clickRef.current = new Howl({
      src: ["/sounds/click.mp3"],
      volume: VOLUME_CLICK,
      preload: true,
    });

    // Son de victoire — joué à la fin de la partie
    victoryRef.current = new Howl({
      src: ["/sounds/victory.mp3"],
      volume: VOLUME_VICTORY,
      preload: true,
    });

    // Musique de fond — en boucle, dépend du choix du joueur
    // src accepte un tableau : Howler essaie le premier format dispo
    bgRef.current = new Howl({
      src: [`/sounds/${music}.mp3`],
      volume: VOLUME_BG,
      loop: true,    // Boucle infinie
      preload: true,
    });

    // ⚠️ Cleanup : on arrête et détruit les sons
    // quand le composant se démonte ou quand music change
    return () => {
      bgRef.current?.stop();
      bgRef.current?.unload();
      clickRef.current?.unload();
      victoryRef.current?.unload();
    };
  }, [music]); // Se réinitialise si le joueur change de musique

  // ─────────────────────────────────────────
  // ▶️ Démarrer la musique de fond
  // ─────────────────────────────────────────
  const startMusic = useCallback(() => {
    if (bgRef.current && !bgRef.current.playing()) {
      bgRef.current.play();
    }
  }, []);

  // ─────────────────────────────────────────
  // ⏹️ Arrêter la musique de fond
  // ─────────────────────────────────────────
  const stopMusic = useCallback(() => {
    bgRef.current?.stop();
  }, []);

  // ─────────────────────────────────────────
  // 👆 Jouer le son de clic
  // ─────────────────────────────────────────
  const playClick = useCallback(() => {
    // rate() permet de varier légèrement la hauteur du son
    // pour éviter la répétition monotone
    if (clickRef.current) {
      clickRef.current.rate(0.9 + Math.random() * 0.2); // Entre 0.9x et 1.1x
      clickRef.current.play();
    }
  }, []);

  // ─────────────────────────────────────────
  // 🏆 Jouer le son de victoire / fin
  // ─────────────────────────────────────────
  const playVictory = useCallback(() => {
    victoryRef.current?.play();
  }, []);

  // ─────────────────────────────────────────
  // 🔇 Toggle mute global
  // Howler.mute() coupe TOUS les sons d'un coup
  // ─────────────────────────────────────────
  const toggleMute = useCallback(() => {
    const next = !isMuted;
    Howler.mute(next); // Mute global — affecte tous les Howl
    setIsMuted(next);
  }, [isMuted]);

  return {
    startMusic,   // Appeler au DÉMARRER
    stopMusic,    // Appeler à la fin de partie
    playClick,    // Appeler à chaque clic réussi
    playVictory,  // Appeler quand hasEnded = true
    toggleMute,   // Bouton mute dans le header
    isMuted,      // État affiché dans le header
  };
}
