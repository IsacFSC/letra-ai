"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  Mic2Icon,
  XSquareIcon,
  Youtube,
} from "lucide-react";

// 🎨 cores por tipo
const sectionColors: Record<string, string> = {
  VERSE: "text-blue-300",
  CHORUS: "text-green-300",
  BRIDGE: "text-purple-300",
  INTRO: "text-yellow-300",
  OUTRO: "text-red-300",
  BUILD: "text-orange-300",
  DROP: "text-pink-300",
};

// Traduções para os tipos de seção
const sectionLabels: Record<string, string> = {
  VERSE: "Verso",
  CHORUS: "Refrão",
  BRIDGE: "Ponte",
  INTRO: "Introdução",
  OUTRO: "Final",
  BUILD: "Construção",
  DROP: "Queda",
};

type Section = {
  id: string;
  type: string;
  content: string;
};

type Song = {
  id: string;
  title: string;
  artist: string;
  youtubeUrl?: string | null;
  sections: Section[];
};

export default function StagePageClient({ song }: { song: Song }) {
  const router = useRouter();

  const [fontSize, setFontSize] = useState(20);
  const [autoScroll, setAutoScroll] = useState(false);
  const [speed] = useState(30); // Velocidade fixa padrão
  const [focusMode, setFocusMode] = useState(false);
  const [showYoutube, setShowYoutube] = useState(false);

  // Extrai o ID do vídeo e gera a URL de embed
  const embedUrl = React.useMemo(() => {
    if (!song.youtubeUrl) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = song.youtubeUrl.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  }, [song.youtubeUrl]);

  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ✅ Cálculo dinâmico das seções com labels numerados (igual ao editor)
  const sectionsWithLabels = React.useMemo(() => {
    const counts: Record<string, number> = {};
    return song.sections.map((sec) => {
      const type = sec.type;
      counts[type] = (counts[type] || 0) + 1;
      return {
        ...sec,
        label: `${sectionLabels[type] || type} ${counts[type]}`,
      };
    });
  }, [song.sections]);

  const scrollToSection = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
    });
  };

  useEffect(() => {
    let raf: number;
    let lastTime = performance.now();

    const scroll = (time: number) => {
        if (!containerRef.current) return;

        const delta = time - lastTime; // tempo entre frames
        lastTime = time;

        // velocidade em px por segundo (ajustável)
        const pixelsPerSecond = speed;

        // converte pra frame atual
        const move = (pixelsPerSecond * delta) / 1000;

        containerRef.current.scrollTop += move;

        raf = requestAnimationFrame(scroll);
    };

    if (autoScroll) {
        lastTime = performance.now();
        raf = requestAnimationFrame(scroll);
    }

    return () => cancelAnimationFrame(raf);
    }, [autoScroll, speed]);

  return (
    <main className="bg-black text-white flex flex-col h-screen">
      {/* HEADER */}
      {!focusMode && (
        <div className="p-4 border-b border-white/10 flex items-center">
          <button onClick={() => router.push("/dashboard")}>
            <ArrowLeftIcon className="h-6 w-6 text-zinc-400" />
          </button>
          <div className="flex-1 items-center inline-block justify-center mx-auto" >
            <h1 className="text-center font-bold line-clamp-1 w-64">
                {song.title}
            </h1>
            <p className="text-center text-xs text-zinc-500 line-clamp-1 w-64">
                {song.artist}
            </p>
          </div>
        </div>
      )}

      {/* PLAYER DE YOUTUBE (MODO EMBED) */}
      {showYoutube && embedUrl && (
        <div className="w-full aspect-video bg-black border-b border-white/10 shrink-0">
          <iframe
            src={`${embedUrl}?autoplay=1&modestbranding=1&rel=0`}
            className="w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* LETRA */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-5 pb-32 pt-6"
        style={{ fontSize }}
      >
        {sectionsWithLabels.map((section) => (
          <div
            key={section.id}
            ref={(el) => {
              sectionRefs.current[section.id] = el;
            }}
            className="mb-10"
          >
            <h3
              className={`mb-3 text-xs uppercase ${
                sectionColors[section.type] || "text-zinc-400"
              }`}
            >
              {section.label}
            </h3>

            {section.content.split("\n").map((line, i) => (
              <p key={i} className="mb-2 leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>

      {/* CONTROLES */}
      {!focusMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 p-3 flex flex-wrap gap-2 items-center justify-between">
          
          {/* fonte */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFontSize((s) => Math.max(18, s - 2))}
              className="flex items-center justify-center w-11 h-11 rounded-full 
                        bg-zinc-800 border border-white text-white text-lg font-semibold
                        active:scale-95 active:bg-zinc-700 transition"
            >
              A−
            </button>

            <span className="text-sm text-zinc-300 min-w-[40px] text-center">
              {fontSize}
            </span>

            <button
              onClick={() => setFontSize((s) => Math.min(48, s + 2))}
              className="flex items-center justify-center w-11 h-11 rounded-full 
                        bg-zinc-800 border border-white text-white text-lg font-semibold
                        active:scale-95 active:bg-zinc-700 transition"
            >
              A+
            </button>
          </div>

          <button 
            className="ml-auto bg-white/15 px-1.5 py-1 text-xs rounded"
            onClick={() => setFocusMode(true)}>
            <Mic2Icon className="h-6 w-6 text-emerald-500" />
          </button>

          {/* youtube */}
          {song.youtubeUrl && (
            <button
              onClick={() => setShowYoutube(!showYoutube)}
              className={`p-1.5 rounded-lg transition-all ${
                showYoutube ? "bg-red-600 text-white" : "bg-zinc-800 hover:bg-zinc-700 text-red-500"
              }`}
              aria-label={showYoutube ? "Fechar player" : "Abrir player"}
            >
              <Youtube className="w-6 h-6" />
            </button>
          )}

            {/* foco
            <button 
              className="ml-auto bg-white/15 px-1.5 py-1 text-xs rounded"
              onClick={() => setFocusMode(true)}>
              <TargetIcon className="h-4 w-4 text-emerald-500 bg-black rounded-full" />
            </button> */}
        </div>
      )}

      {/* navegação por seção */}
      {!focusMode && (
        <div className="fixed bottom-20 left-0 right-0 flex gap-2 overflow-x-auto px-3 bg-black py-2">
          {sectionsWithLabels.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className="px-3 py-1 text-xs bg-purple-800 rounded-full whitespace-nowrap"
            >
              {sec.label}
            </button>
          ))}
        </div>
      )}

      {/* modo foco */}
      {focusMode && (
        <button
          onClick={() => setFocusMode(false)}
          className="fixed top-4 right-4 px-3 py-1 text-xs rounded"
        >
          <XSquareIcon className="h-6 w-6 text-emerald-500" />
        </button>
      )}
    </main>
  );
}