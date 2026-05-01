"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, Mic2Icon, Pause, Play, TargetIcon, TestTube } from "lucide-react";
import { Updock } from "next/font/google";

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

  const [fontSize, setFontSize] = useState(24);
  const [autoScroll, setAutoScroll] = useState(false);
  const [speed, setSpeed] = useState(0.0);
  const [focusMode, setFocusMode] = useState(false);

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
          <button 
            className="ml-auto bg-white/15 px-1.5 py-1 text-xs rounded"
            onClick={() => setFocusMode(true)}>
            <Mic2Icon className="h-6 w-6 text-emerald-500" />
          </button>
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
          <div className="flex gap-2 items-start">
            <button className="rounded-full px-1.5 py-1 font-serif border border-white bg-zinc-800" onClick={() => setFontSize((s) => Math.max(18, s - 2))}>
              A-
            </button>
            <button className="rounded-full px-1 py-1 font-serif border border-white bg-zinc-800" onClick={() => setFontSize((s) => Math.min(48, s + 2))}>
              A+
            </button>
          </div>

          {/* play scroll */}
          <button
            onClick={() => setAutoScroll((v) => !v)}
            className="rounded-full bg-white/10"
            >
            {autoScroll ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <div className="block justify-center mx-auto items-center gap-2">
            
            {/* <Play className="w-4 h-4 text-zinc-400" /> */}
            
            <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="flex-1 accent-emerald-500"
            />

            {/* <span className=" hidden text-xs text-zinc-400 w-12 text-right">
                {Math.round(speed)}
            </span> */}
          </div>

          {/* youtube */}
          {song.youtubeUrl && (
            <a
              href={song.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-0.5 bg-zinc-800 hover:bg-zinc-700 text-red-500 rounded-lg transition-colors"
              aria-label="Abrir no YouTube"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path d="M21.8 8s-.2-1.4-.8-2c-.7-.8-1.5-.8-1.9-.9C16.4 5 12 5 12 5h0s-4.4 0-7.1.1c-.4.1-1.2.1-1.9.9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.6C2 14.4 2.2 16 2.2 16s.2 1.4.8 2c.7.8 1.6.8 2 .9 1.5.1 6.9.1 6.9.1s4.4 0 7.1-.1c.4-.1 1.2-.1 1.9-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.6C22 9.6 21.8 8 21.8 8zM9.8 14.6V9.4l5.2 2.6-5.2 2.6z" />
              </svg>
            </a>
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
              className="px-3 py-1 text-xs bg-emerald-800 rounded-full whitespace-nowrap"
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
          className="fixed top-4 right-4 bg-white/10 px-3 py-1 text-xs rounded"
        >
          sair
        </button>
      )}
    </main>
  );
}