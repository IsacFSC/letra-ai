"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, ListMusic, Calendar, ChevronUp } from "lucide-react";

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

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-white/5 bg-zinc-900/90 py-2 shadow-2xl backdrop-blur-xl">
      <button onClick={handleScrollToTop} className="flex flex-col items-center text-zinc-400 hover:text-white transition-colors">
        <ChevronUp className="h-5 w-5" />
        <span className="text-xs">Ir ao topo</span>
      </button>

      <Link href="/schedule">
        <button className="flex flex-col items-center text-zinc-400 hover:text-white transition-colors">
          <Calendar className="h-5 w-5" />
          <span className="text-xs">Escala</span>
        </button>
      </Link>

      <Link href="/dashboard">
        <button className="flex flex-col items-center text-zinc-400 hover:text-white transition-colors">
          <ListMusic className="h-5 w-5" />
          <span className="text-xs">Minhas Letras</span>
        </button>
      </Link>
    </nav>
  );
}
