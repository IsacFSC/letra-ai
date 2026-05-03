"use client";

import { useState, useEffect } from "react"; // Adicionado useEffect para consistência, embora não usado diretamente aqui
import Link from "next/link";
import { Home, ListMusic, Music, ChevronUp, ChevronDown, Calendar } from "lucide-react";

interface Section {
  id: string;
  type: string;
  label?: string;
  content: string;
  order: number;
  color?: string;
}

interface PlaylistSong {
  id: string;
  title: string;
  artist: string;
  youtubeUrl?: string | null;
}

interface DailyPlaylist {
  id: string;
  name: string;
  date: string;
  time: string;
  songs: PlaylistSong[];
}

interface MobileNavbarProps {
  sections: Section[];
  scrollToSection: (id: string) => void;
  currentSong?: {
    id?: string;
    title: string;
    artist: string;
    youtubeUrl?: string | null;
  };
}

export default function MobileNavbar({ sections, scrollToSection, currentSong }: MobileNavbarProps) {
  const [isVerseDropdownOpen, setIsVerseDropdownOpen] = useState(false);

  const verses = sections.filter(sec => sec.type === "VERSE");
  const chorus = sections.find(sec => sec.type === "CHORUS");

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-white/5 bg-zinc-900/90 py-2 shadow-2xl backdrop-blur-xl">
      <button onClick={handleScrollToTop} className="flex flex-col items-center text-zinc-400 hover:text-white transition-colors">
        <Home className="h-5 w-5" />
        <span className="text-xs">Início</span>
      </button>

      <Link href="/schedule">
        <button className="flex flex-col items-center text-zinc-400 hover:text-white transition-colors">
          <Calendar className="h-5 w-5" />
          <span className="text-xs">Escala</span>
        </button>
      </Link>

      <div className="relative">
        <button
          onClick={() => setIsVerseDropdownOpen(!isVerseDropdownOpen)}
          className="flex flex-col items-center text-zinc-400 hover:text-white transition-colors"
        >
          <Music className="h-5 w-5" />
          <span className="text-xs">Versos</span>
          {isVerseDropdownOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        {isVerseDropdownOpen && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-800 rounded-lg shadow-lg p-2 max-h-40 overflow-y-auto">
            {verses.length > 0 ? (
              verses.map((verse) => (
                <button
                  key={verse.id}
                  onClick={() => { scrollToSection(verse.id); setIsVerseDropdownOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700 rounded-md"
                >
                  {verse.label || "Verso"}
                </button>
              ))
            ) : (
              <span className="block px-3 py-2 text-sm text-zinc-500">Nenhum verso</span>
            )}
          </div>
        )}
      </div>

      {chorus && (
        <button onClick={() => scrollToSection(chorus.id)} className="flex flex-col items-center text-zinc-400 hover:text-white transition-colors">
          <ListMusic className="h-5 w-5" />
          <span className="text-xs">Refrão</span>
        </button>
      )}

      <Link href="/dashboard">
        <button className="flex flex-col items-center text-zinc-400 hover:text-white transition-colors">
          <ListMusic className="h-5 w-5" />
          <span className="text-xs">Minhas Letras</span>
        </button>
      </Link>
    </nav>
  );
}
