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
  Disc2,
  PersonStanding,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import MobileNavbar from "@/components/MobileNavbar";
import { fetchLyrics } from "@/services/lyricsService";
import { fetchYoutubeVideoInfo } from "@/services/youtubeService";
import { createSong, updateSong } from "@/app/actions/song-actions";
import { SectionType } from "src/types/sectionTypes";

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

// 🎨 Cores por tipo (Sincronizado com o Stage para consistência)
const sectionColors: Record<string, string> = {
  VERSE: "text-blue-300",
  CHORUS: "text-green-300",
  BRIDGE: "text-purple-300",
  INTRO: "text-yellow-300",
  OUTRO: "text-red-300",
  BUILD: "text-orange-300",
  DROP: "text-pink-300",
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
  const [loadingYoutube, setLoadingYoutube] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const addSection = (type: SectionType) => {
    const id = `${type.toLowerCase()}-${Date.now()}`;
    const newSection: Section = {
      id,
      type,
      label: `${sectionLabels[type]}`,
      content: "",
      order: formData.sections.length,
    };

    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

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
  // BUSCA YOUTUBE
  // =========================

  const handleYoutubeSearch = async () => {
    if (!formData.youtubeUrl) {
      toast.error("Insira um link do YouTube primeiro");
      return;
    }

    try {
      setLoadingYoutube(true);
      const info = await fetchYoutubeVideoInfo(formData.youtubeUrl);
      
      setFormData(prev => ({
        ...prev,
        title: info.title,
        artist: info.artist
      }));

      toast.success("Informações importadas!");
    } catch (err) {
      toast.error("Erro ao buscar dados do vídeo");
    } finally {
      setLoadingYoutube(false);
    }
  };

  // =========================
  // BUSCA LETRA
  // =========================

  const handleSearch = async () => {
    if (!formData.title || !formData.artist) {
      toast.error("Preencha Título e Artista para buscar a letra");
      return;
    }

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
      toast.error("Não encontramos a letra. Use os botões abaixo para adicionar trechos manualmente.");
    } finally {
      setSearching(false);
    }
  };

  // =========================
  // SAVE (simplificado)
  // =========================

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title) return toast.error("A música precisa de um título");

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        artist: formData.artist || "",
        youtubeUrl: formData.youtubeUrl || "",
        sections: sectionsWithLabels.map((s, i) => ({
          id: s.id,
          type: s.type,
          content: s.content,
          order: i,
          color: s.color || sectionColors[s.type],
        })),
      };

      if (formData.id) {
        await updateSong(formData.id, payload);
      } else {
        await createSong(payload);
      }

      toast.success("Salvo!");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const [expanded, setExpanded] = useState(false);
  const sectionTypes = Object.keys(sectionLabels) as SectionType[];

  const visibleSections = expanded
    ? sectionTypes
    : sectionTypes.slice(0, 3);

  // ✅ Cálculo dinâmico das seções com labels numerados
  // Usamos useMemo para garantir que a referência da array seja estável se os dados não mudarem
  const sectionsWithLabels = React.useMemo(() => {
    const counts: Record<string, number> = {};
    return formData.sections.map((sec) => {
      const type = sec.type;
      counts[type] = (counts[type] || 0) + 1;
      return {
        ...sec,
        label: `${sectionLabels[type] || type} ${counts[type]}`,
      };
    });
  }, [formData.sections]);

  // =========================
  // UI
  // =========================

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* HEADER */}
      <div className="p-2 flex items-center border-b border-white/20">
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
        {/* YouTube Import Area */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              className="w-full p-2 pl-10 bg-zinc-900 rounded border border-white/5 focus:border-brand-green outline-none transition-all"
              placeholder="Link do YouTube (opcional)"
              value={formData.youtubeUrl ?? ""}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
            />
          </div>
          <button 
            type="button" 
            onClick={handleYoutubeSearch}
            disabled={loadingYoutube}
            className="bg-white/10 p-2 rounded hover:bg-white/20 transition-colors disabled:opacity-50"
            title="Auto-preencher Título e Artista"
          >
            {loadingYoutube ? <Loader2 className="animate-spin" /> : <Search />}
          </button>
        </div>

        <div className="relative group">
          <Disc2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            className="w-full p-2 pl-10 bg-zinc-900 rounded"
            placeholder="Título da música"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="lucide lucide-user-star-icon lucide-user-star absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-brand-green transition-colors">
              <path d="M16.051 12.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.866l-1.156-1.153a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z"/>
              <path d="M8 15H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/>
            </svg>
            <input
              className="w-full flex-1 p-2 pl-10 mx-auto bg-zinc-900 rounded"
              placeholder="Artista"
              value={formData.artist ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, artist: e.target.value })
              }
            />
          </div>
          <button 
            type="button" 
            onClick={handleSearch}
            disabled={searching}
            className="bg-emerald-600/20 text-emerald-400 p-2 rounded hover:bg-emerald-600/30 flex gap-2 items-center text-sm font-medium"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music2 className="w-4 h-4" />} Letra
          </button>
        </div>

        {/* Adição Manual de Seções */}
        <div className="space-y-2">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            Adicionar Seção Manualmente
          </p>

          <div className="flex flex-wrap gap-2">
            {visibleSections.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => addSection(type)}
                className="px-2 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-500" />
                {sectionLabels[type]}
              </button>
            ))}

            {/* Botão expandir/recolher */}
            {sectionTypes.length > 3 && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="px-1.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 border border-emerald-600 rounded-lg text-xs font-medium"
              >
                {expanded ? "▲ Ver menos" : "▼ Ver mais"}
              </button>
            )}
          </div>
        </div>

        {/* SEÇÕES */}
        <div className="space-y-3">
          {sectionsWithLabels.map((sec) => (
            <div key={sec.id} ref={(el) => {
              sectionRefs.current[sec.id] = el;
            }}>
              <div className="flex items-center gap-2 justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${sec.color || sectionColors[sec.type] || 'text-zinc-400'}`}>
                  {sec.label}
                </span>

                <div className="flex justify-end items-center gap-2">
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
                className="w-full bg-zinc-900 p-3 mt-2 rounded-lg border border-white/5 focus:border-emerald-500/50 outline-none min-h-[120px] text-sm leading-relaxed"
                placeholder={`Cole o conteúdo do ${(sectionLabels[sec.type] || sec.type).toLowerCase()} aqui...`}
                value={sec.content}
                onChange={(e) =>
                  updateSectionContent(sec.id, e.target.value)
                }
              />
            </div>
          ))}
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="flex justify-center items-center mb-18 mx-auto px-1.5 bg-brand-green text-black font-bold py-1 rounded-xl hover:bg-green-400 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="inline-block mr-2" />}
          <span className="inline-block">{saving ? "Salvando..." : "Salvar"}</span>
        </button>
      </form>

      {/* NAVBAR */}
      <MobileNavbar
        sections={sectionsWithLabels}
        scrollToSection={scrollToSection} // ✅ agora existe corretamente
        currentSong={{
          id: formData.id,
          title: formData.title,
          artist: formData.artist ?? "",
          youtubeUrl: formData.youtubeUrl,
        }}
      />
    </main>
  );
}