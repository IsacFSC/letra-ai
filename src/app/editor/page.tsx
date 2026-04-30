"use client";

import { fetchSongById, createSong, updateSong } from "@/app/actions/song-actions";
import { useSearchParams } from "next/navigation";
import React, { useState, useCallback, useRef } from "react";
import { MotionFadeIn } from "@/components/motion-fade-in";
import { BeamEffect } from "@/components/beam-effect";
import { Search, Plus, Save, Youtube, ChevronLeft, Type, Loader2, Trash2, ArrowUp, ArrowDown, Sparkles, Music2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import MobileNavbar from "@/components/MobileNavbar";
import { fetchLyrics } from "@/services/lyricsService";
import { SectionType } from "@prisma/client";
import { Suspense } from "react";

const sectionTypeLabel: Record<SectionType, string> = {
  VERSE: "Verso",
  CHORUS: "Refrão",
  BRIDGE: "Ponte",
  OUTRO: "Final",
  INTRO: "Introdução",
  BUILD: "Construção",
  DROP: "Queda",
};

function EditorContent() {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searching, setSearching] = useState(false);
  const [fetchingYoutubeInfo, setFetchingYoutubeInfo] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    youtubeUrl: "",
    sections: [] as { id: string; type: SectionType; label: string; content: string; order: number; color?: string }[],
  });
  const [nextVerseNumber, setNextVerseNumber] = useState(1);
  const [nextChorusNumber, setNextChorusNumber] = useState(1);
  const [nextBridgeNumber, setNextBridgeNumber] = useState(1);
  const [nextIntroNumber, setNextIntroNumber] = useState(1);
  const [nextBuildNumber, setNextBuildNumber] = useState(1);
  const [nextDropNumber, setNextDropNumber] = useState(1);

  // Ref para as seções para rolagem
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Centralização de constantes de estilo
  const sectionColors: Record<string, string> = { 
    "verso": "text-blue-300", 
    "refrão": "text-green-300", 
    "ponte": "text-purple-300", // Corrigido de 330 para 300
    "final": "text-red-300",
    "introdução": "text-yellow-300",
    "construção": "text-orange-300",
    "queda": "text-pink-300",
  };

  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  React.useEffect(() => {
    async function loadSong() {
      if (!editId) return;

      try {
        const song = await fetchSongById(editId);

        let vCount = 0;
        let cCount = 0;
        let bCount = 0;
        let iCount = 0;
        let uCount = 0;
        let dCount = 0;

        const mappedSections = song.sections.map((sec) => {
          const baseLabel = sectionTypeLabel[sec.type as SectionType] || "Verso";
          let label = baseLabel;

          if (sec.type === SectionType.VERSE) label = `${baseLabel} ${++vCount}`;
          else if (sec.type === SectionType.CHORUS) label = `${baseLabel} ${++cCount}`;
          else if (sec.type === SectionType.BRIDGE) label = `${baseLabel} ${++bCount}`;
          else if (sec.type === SectionType.INTRO) label = `${baseLabel} ${++iCount}`;
          else if (sec.type === SectionType.BUILD) label = `${baseLabel} ${++uCount}`;
          else if (sec.type === SectionType.DROP) label = `${baseLabel} ${++dCount}`;

          return {
            id: sec.id,
            type: sec.type as SectionType,
            label: label,
            content: sec.content,
            order: sec.order,
            color: sec.color ?? undefined,
          };
        });

        setFormData({
          title: song.title,
          artist: song.artist ?? "",
          youtubeUrl: song.youtubeUrl ?? "",
          sections: mappedSections,
        });

        // Sincroniza os contadores globais para novas adições
        setNextVerseNumber(vCount + 1);
        setNextChorusNumber(cCount + 1);
        setNextBridgeNumber(bCount + 1);
        setNextIntroNumber(iCount + 1);
        setNextBuildNumber(uCount + 1);
        setNextDropNumber(dCount + 1);

        setIsAddingNew(true);
      } catch (err) {
        toast.error("Erro ao carregar música para edição");
      }
    }

    loadSong();
  }, [editId]);


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const loadingToast = toast.loading("Salvando música...");

    try {
      await createSong({
        title: formData.title,
        artist: formData.artist,
        youtubeUrl: formData.youtubeUrl,
        sections: formData.sections.map(s => ({
          id: s.id,
          type: s.type, // Enviamos o tipo técnico (VERSE, CHORUS, etc)
          content: s.content,
          order: s.order,
          color: s.color
        })),
      });

      toast.success("Música salva com sucesso!");
      setIsAddingNew(false);

      setFormData({
        title: "",
        artist: "",
        youtubeUrl: "",
        sections: [],
      });
    } catch (err) {
      toast.error("Erro ao salvar música");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleYoutubeAutoFill = async () => {
    if (!formData.youtubeUrl) {
      toast.error("Por favor, insira um link do YouTube.");
      return;
    }
    setFetchingYoutubeInfo(true);
    try {
      const res = await fetch(`/api/youtube-info?url=${encodeURIComponent(formData.youtubeUrl)}`);
      if (!res.ok) {
        throw new Error("Erro ao buscar informações do YouTube");
      }
      const videoInfo = await res.json();
      setFormData((prev) => ({
        ...prev,
        title: videoInfo.title,
        artist: videoInfo.artist,
      }));
      toast.success("Informações do YouTube preenchidas!");
    } catch (error) {
      toast.error("Não foi possível obter informações do YouTube. Verifique o link.");
    } finally {
      setFetchingYoutubeInfo(false);
    }
  };

  const handleSearch = async () => {
    if (!formData.title || !formData.artist) {
      toast.error("Preencha Título e Artista para buscar.");
      return;
    }
    setSearching(true);
    try {
      const lyrics = await fetchLyrics(formData.artist, formData.title);
      const initialType = SectionType.VERSE;
      setFormData({
        ...formData,
        sections: [{ 
          id: `verse-${nextVerseNumber}`, 
          type: initialType,
          label: `Verso ${nextVerseNumber}`,
          content: lyrics, 
          order: 0,
          color: sectionColors.verso 
        }],
      });
      setNextVerseNumber(nextVerseNumber + 1);
      toast.success("Letra encontrada!");
    } catch (err) {
      toast.error("Não encontramos letras para essa música. Tente novamente.");
    } finally {
      setSearching(false);
    }
  };

  const addSection = (baseType: "Verso" | "Refrão" | "Ponte" | "Final" | "Introdução" | "Construção" | "Queda", content: string = "") => {
    let type: SectionType = SectionType.VERSE;
    let label = "";

    if (baseType === "Verso") {
      type = SectionType.VERSE;
      label = `Verso ${nextVerseNumber}`;
      setNextVerseNumber(nextVerseNumber + 1);
    } else if (baseType === "Refrão") {
      type = SectionType.CHORUS;
      label = `Refrão ${nextChorusNumber}`;
      setNextChorusNumber(prev => prev + 1);
    } else if (baseType === "Ponte") {
      type = SectionType.BRIDGE;
      label = `Ponte ${nextBridgeNumber}`;
      setNextBridgeNumber(nextBridgeNumber + 1);
    } else if (baseType === "Final") {
      type = SectionType.OUTRO;
      label = "Final";
    } else if (baseType === "Introdução") {
      type = SectionType.INTRO;
      label = `Introdução ${nextIntroNumber}`;
      setNextIntroNumber(nextIntroNumber + 1);
    } else if (baseType === "Construção") {
      type = SectionType.BUILD;
      label = `Construção ${nextBuildNumber}`;
      setNextBuildNumber(nextBuildNumber + 1);
    } else if (baseType === "Queda") {
      type = SectionType.DROP;
      label = `Queda ${nextDropNumber}`;
      setNextDropNumber(nextDropNumber + 1);
    }

    const newSection = {
      id: `${type.toLowerCase()}-${Date.now()}`,
      type,
      label,
      content,
      order: formData.sections.length, // Adiciona a ordem para manter a sequência
      color: sectionColors[baseType.toLowerCase()] || sectionColors.verso,
    };

    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection].sort((a, b) => a.order - b.order),
    }));
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    setFormData(prev => {
      const index = prev.sections.findIndex(sec => sec.id === id);
      if (index === -1) return prev;

      const newSections = [...prev.sections];
      const [movedSection] = newSections.splice(index, 1);
      const newIndex = direction === 'up' ? Math.max(0, index - 1) : Math.min(newSections.length, index + 1);
      newSections.splice(newIndex, 0, movedSection);

      return { ...prev, sections: newSections.map((sec, idx) => ({ ...sec, order: idx })) };
    });
  };

  const deleteSection = (id: string) => {
    setFormData((prev) => {
      const sectionToDelete = prev.sections.find((sec) => sec.id === id);
      if (!sectionToDelete) return prev;

      const updatedSections = prev.sections.filter((sec) => sec.id !== id);

      // Ajustar os contadores com base no tipo técnico
      if (sectionToDelete.type === SectionType.VERSE) {
        setNextVerseNumber(updatedSections.filter(sec => sec.type === SectionType.VERSE).length + 1);
      } else if (sectionToDelete.type === SectionType.CHORUS) {
        setNextChorusNumber(updatedSections.filter(sec => sec.type === SectionType.CHORUS).length + 1);
      } else if (sectionToDelete.type === SectionType.BRIDGE) {
        setNextBridgeNumber(updatedSections.filter(sec => sec.type === SectionType.BRIDGE).length + 1);
      } else if (sectionToDelete.type === SectionType.INTRO) {
        setNextIntroNumber(updatedSections.filter(sec => sec.type === SectionType.INTRO).length + 1);
      } else if (sectionToDelete.type === SectionType.BUILD) {
        setNextBuildNumber(updatedSections.filter(sec => sec.type === SectionType.BUILD).length + 1);
      } else if (sectionToDelete.type === SectionType.DROP) {
        setNextDropNumber(updatedSections.filter(sec => sec.type === SectionType.DROP).length + 1);
      }

      return {
        ...prev,
        sections: updatedSections,
      };
    });
  };

  const updateSectionContent = (id: string, newContent: string) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === id ? { ...sec, content: newContent } : sec
      ),
    }));
  };

  const scrollToSection = useCallback((id: string) => {
    const element = sectionRefs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <main className="bg-brand-black relative flex min-h-svh w-full flex-col">
      <BeamEffect />
      <MotionFadeIn>
        <nav className="border-white/5 sticky top-0 z-10 flex w-full items-center justify-between border-b bg-zinc-900/30 p-4 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
              <ChevronLeft className="h-7 w-7" />
            </Link>
            <h2 className="text-gradient-gray text-xl font-bold">Modo Editor</h2>
          </div>
          {!isAddingNew && (
            <button onClick={() => setIsAddingNew(true)} className="p-2 bg-brand-green rounded-full text-black hover:scale-110 transition-transform">
              <Plus className="h-6 w-6" />
            </button>
          )}
        </nav>

        <div className="flex-1 p-6">
          {!isAddingNew ? (
            <div className="text-center py-20">
              <div className="bg-white/5 inline-block p-6 rounded-full border border-white/10 mb-4">
                <Search className="h-12 w-12 text-zinc-600" />
              </div>
              <p className="text-zinc-500 font-medium">Clique no botão "+" para adicionar ou buscar uma música.</p>
            </div>
          ) : (
            <form className="glass-card p-6 space-y-4 max-w-2xl mx-auto" onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Nome da música" className="input-field" required
                  value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                <input type="text" placeholder="Cantor ou Banda" className="input-field" required
                  value={formData.artist} onChange={(e) => setFormData({...formData, artist: e.target.value})} />
              </div>
              <div className="flex gap-2 items-center">
                <div className="relative group flex-1">
                  <Youtube className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-red-500" />
                  <input type="url" placeholder="Link YouTube (Referência)" className="input-field pl-12"
                    value={formData.youtubeUrl} onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})} />
                </div>
                <button type="button" onClick={handleYoutubeAutoFill} 
                  title="Preenchimento automático"
                  disabled={fetchingYoutubeInfo || !formData.youtubeUrl}
                  className="bg-zinc-800 px-4 py-3 rounded-2xl text-zinc-300 hover:text-red-500 transition-colors flex items-center justify-center border border-white/5">
                  {fetchingYoutubeInfo ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                </button>
                <button type="button" onClick={handleSearch} 
                  title="Buscar Letra Online"
                  disabled={searching}
                  className="bg-zinc-800 px-4 py-3 rounded-2xl text-zinc-300 hover:text-brand-green transition-colors flex items-center justify-center border border-white/5">
                  {searching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Music2 className="h-5 w-5" />}
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-bold text-zinc-400 ml-2">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4" /> SEÇÕES DA MÚSICA
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => addSection("Verso")} className="px-3 py-1 bg-blue-700/30 text-blue-300 rounded-lg text-xs hover:bg-blue-700/50 transition-colors">
                      + Verso
                    </button>
                    <button type="button" onClick={() => addSection("Refrão")} className="px-3 py-1 bg-green-700/30 text-green-300 rounded-lg text-xs hover:bg-green-700/50 transition-colors">
                      + Refrão
                    </button>
                    <button type="button" onClick={() => addSection("Ponte")} className="px-3 py-1 bg-purple-700/30 text-purple-300 rounded-lg text-xs hover:bg-purple-700/50 transition-colors">
                      + Ponte
                    </button>
                    <button type="button" onClick={() => addSection("Final")} className="px-3 py-1 bg-red-700/30 text-red-300 rounded-lg text-xs hover:bg-red-700/50 transition-colors">
                      + Final
                    </button>
                    <button type="button" onClick={() => addSection("Introdução")} className="px-3 py-1 bg-yellow-700/30 text-yellow-300 rounded-lg text-xs hover:bg-yellow-700/50 transition-colors">
                      + Intro
                    </button>
                    <button type="button" onClick={() => addSection("Construção")} className="px-3 py-1 bg-orange-700/30 text-orange-300 rounded-lg text-xs hover:bg-orange-700/50 transition-colors">
                      + Build
                    </button>
                    <button type="button" onClick={() => addSection("Queda")} className="px-3 py-1 bg-pink-700/30 text-pink-300 rounded-lg text-xs hover:bg-pink-700/50 transition-colors">
                      + Drop
                    </button>
                  </div>
                </div>
                {formData.sections.length === 0 ? (
                  <p className="text-zinc-500 text-center py-10">Adicione uma seção para começar a escrever a letra.</p>
                ) : (
                  <div className="space-y-4">
                    {formData.sections.map((section, index) => (
                      <div key={section.id} ref={(el) => { sectionRefs.current[section.id] = el; }} className="relative group">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-bold ${section.color}`}>{section.label}</span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={() => moveSection(section.id, 'up')} disabled={index === 0} className="p-1 rounded-md hover:bg-white/10 disabled:opacity-50">
                              <ArrowUp className="h-4 w-4 text-zinc-400" />
                            </button>
                            <button type="button" onClick={() => moveSection(section.id, 'down')} disabled={index === formData.sections.length - 1} className="p-1 rounded-md hover:bg-white/10 disabled:opacity-50">
                              <ArrowDown className="h-4 w-4 text-zinc-400" />
                            </button>
                            <button type="button" onClick={() => deleteSection(section.id)} className="p-1 rounded-md hover:bg-red-500/30">
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                        <textarea
                          className="input-field min-h-25 font-mono text-sm leading-relaxed"
                          placeholder={`Conteúdo para ${section.type}...`}
                          value={section.content}
                          onChange={(e) => updateSectionContent(section.id, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="w-full bg-brand-green text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:bg-green-400 transition-all">
                <Save className="h-5 w-5" /> SALVAR NO REPERTÓRIO
              </button>
            </form>
          )}
        </div>
      </MotionFadeIn>

      {/* Mobile Navbar no rodapé */}
      <MobileNavbar
        sections={formData.sections}
        scrollToSection={scrollToSection}
      />
    </main>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <EditorContent />
    </Suspense>
  );
}