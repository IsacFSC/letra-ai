"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Save,
  Plus,
  Search,
  Youtube,
  Loader2,
  ChevronLeft,
  Type,
  Music2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import MobileNavbar from "@/components/MobileNavbar";
import { fetchLyrics } from "@/services/lyricsService";
import { SectionType } from "@prisma/client";

// =========================
// TIPOS FLEXÍVEIS (sem DTO)
// =========================

type Section = {
  id: string;
  type: SectionType;
  label: string;
  content: string;
  order: number;
  color?: string;
};

type Song = {
  id: string;
  title: string;
  artist: string | null; // ✅ IMPORTANTE: aceita null
  youtubeUrl?: string | null;
  sections: Section[];
};

// =========================
// PROPS
// =========================

export default function EditorClient({
  initialSong,
}: {
  initialSong: Song | null;
}) {
  const router = useRouter();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searching, setSearching] = useState(false);

  const [formData, setFormData] = useState<Song>({
    id: "",
    title: "",
    artist: "",
    youtubeUrl: "",
    sections: [],
  });

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // =========================
  // LOAD (normalização aqui)
  // =========================

  useEffect(() => {
    if (!initialSong) return;

    setFormData({
      id: initialSong.id,
      title: initialSong.title,
      artist: initialSong.artist ?? "", // ✅ normaliza null → ""
      youtubeUrl: initialSong.youtubeUrl ?? "",
      sections: initialSong.sections ?? [],
    });

    setIsAddingNew(true);
  }, [initialSong]);

  // =========================
  // SCROLL
  // =========================

  const scrollToSection = useCallback((id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // =========================
  // SEÇÕES
  // =========================

  const updateSectionContent = (id: string, content: string) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === id ? { ...s, content } : s
      ),
    }));
  };

  const deleteSection = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id),
    }));
  };

  const moveSection = (id: string, dir: "up" | "down") => {
    setFormData((prev) => {
      const index = prev.sections.findIndex((s) => s.id === id);
      if (index === -1) return prev;

      const newSections = [...prev.sections];
      const [item] = newSections.splice(index, 1);

      const newIndex =
        dir === "up"
          ? Math.max(0, index - 1)
          : Math.min(newSections.length, index + 1);

      newSections.splice(newIndex, 0, item);

      return { ...prev, sections: newSections };
    });
  };

  // =========================
  // BUSCA LETRA
  // =========================

  const handleSearch = async () => {
    try {
      setSearching(true);

      const lyrics = await fetchLyrics(formData.artist ?? "", formData.title);

      setFormData((prev) => ({
        ...prev,
        sections: [
          {
            id: `verse-${Date.now()}`,
            type: SectionType.VERSE,
            label: "Verso 1",
            content: lyrics,
            order: 0,
          },
        ],
      }));

      toast.success("Letra encontrada!");
    } catch {
      toast.error("Não foi possível buscar a letra");
    } finally {
      setSearching(false);
    }
  };

  // =========================
  // SAVE (simplificado)
  // =========================

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/song/save", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();

      toast.success("Salvo!");
      router.push("/dashboard");
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* HEADER */}
      <div className="p-4 flex items-center border-b border-white/10">
        <Link href="/dashboard">
          <ChevronLeft />
        </Link>

        <h1 className="flex-1 text-center font-bold">Editor</h1>

        <button onClick={() => setIsAddingNew(true)}>
          <Plus />
        </button>
      </div>

      {/* FORM */}
      <form onSubmit={handleSave} className="p-4 space-y-4 flex-1">
        <input
          className="w-full p-2 bg-zinc-900 rounded"
          placeholder="Título"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
        />

        <input
          className="w-full p-2 bg-zinc-900 rounded"
          placeholder="Artista"
          value={formData.artist ?? ""}
          onChange={(e) =>
            setFormData({ ...formData, artist: e.target.value })
          }
        />

        <button type="button" onClick={handleSearch}>
          <Music2 />
        </button>

        {/* SEÇÕES */}
        <div className="space-y-3">
          {formData.sections.map((sec) => (
            <div key={sec.id} ref={(el) => {
              sectionRefs.current[sec.id] = el;
            }}>
              <div className="flex justify-between">
                <span>{sec.label}</span>

                <div className="flex gap-2">
                  <button type="button" onClick={() => moveSection(sec.id, "up")}>
                    <ArrowUp />
                  </button>
                  <button type="button" onClick={() => moveSection(sec.id, "down")}>
                    <ArrowDown />
                  </button>
                  <button type="button" onClick={() => deleteSection(sec.id)}>
                    <Trash2 />
                  </button>
                </div>
              </div>

              <textarea
                className="w-full bg-zinc-900 p-2 mt-2"
                value={sec.content}
                onChange={(e) =>
                  updateSectionContent(sec.id, e.target.value)
                }
              />
            </div>
          ))}
        </div>

        <button type="submit" className="w-full bg-green-500 text-black py-3">
          <Save /> Salvar
        </button>
      </form>

      {/* NAVBAR */}
      <MobileNavbar
        sections={formData.sections}
        scrollToSection={scrollToSection} // ✅ agora existe corretamente
      />
    </main>
  );
}