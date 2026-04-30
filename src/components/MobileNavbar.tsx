"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, ListMusic, Music, ChevronUp, ChevronDown } from "lucide-react";

interface Section {
  id: string;
  type: string;
  content: string;
  order: number;
  color?: string;
}

interface MobileNavbarProps {
  sections: Section[];
  scrollToSection: (id: string) => void;
}

export default function MobileNavbar({ sections, scrollToSection }: MobileNavbarProps) {
  const [isVerseDropdownOpen, setIsVerseDropdownOpen] = useState(false);

  const verses = sections.filter(sec => sec.type.startsWith("Verso"));
  const chorus = sections.find(sec => sec.type === "Refrão");

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="fixed bottom-0 left-0 z-20 flex w-full items-center justify-around border-t border-white/5 bg-zinc-900/50 py-2 shadow-md backdrop-blur-lg">
      <button onClick={handleScrollToTop} className="flex flex-col items-center text-zinc-400 hover:text-white transition-colors">
        <Home className="h-5 w-5" />
        <span className="text-xs">Início</span>
      </button>

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
                  {verse.type}
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
          <span className="text-xs">Minhas Músicas</span>
        </button>
      </Link>
    </nav>
  );
}
