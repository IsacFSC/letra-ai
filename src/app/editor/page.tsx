"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { MotionFadeIn } from "@/components/motion-fade-in";
import { BeamEffect } from "@/components/beam-effect";
import { Search, Plus, Save, Youtube, ChevronLeft, Type, Loader2, Trash2, ArrowUp, ArrowDown, Sparkles, Music2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import MobileNavbar from "@/components/MobileNavbar";
import { fetchYoutubeVideoInfo } from "@/services/youtubeService"; // Assumindo que este serviço será criado
import { jsPDF } from "jspdf";
import { saveRepertoryLocally } from "@/lib/uploadthing"; // Atualizado para usar saveRepertoryLocally diretamente

import { fetchLyrics } from "@/services/lyricsService";
import { createSong } from "@/app/actions/song-actions";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function EditorContent() {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searching, setSearching] = useState(false);
  const [fetchingYoutubeInfo, setFetchingYoutubeInfo] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    youtubeUrl: "",
    sections: [] as { id: string; type: string; content: string; order: number; color?: string }[],
  });
  const [nextVerseNumber, setNextVerseNumber] = useState(1);
  const [nextChorusNumber, setNextChorusNumber] = useState(1);
  const [nextBridgeNumber, setNextBridgeNumber] = useState(1);

  // Ref para as seções para rolagem
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const sectionColors: Record<string, string> = { "verso": "text-blue-300", "refrão": "text-green-300", "ponte": "text-purple-330", "final": "text-red-300" };

  const searchParams = useSearchParams();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Iniciando processo de salvar música", formData);
    const loadingToast = toast.loading("Gerando PDF e salvando...");

    try {
      // 1. Gerar PDF localmente
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text(`${formData.title} - ${formData.artist}`, 10, 20);
      doc.setFontSize(12);

      let y = 40;
      formData.sections.forEach((section) => {
        doc.setFont("helvetica", "bold");
        doc.text(section.type, 10, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(section.content, 180);
        doc.text(lines, 10, y);
        y += lines.length * 7 + 10;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });

      const pdfBlob = doc.output("blob");
      const pdfFile = new File([pdfBlob], `${formData.title}.pdf`, { type: "application/pdf" });

      console.log("PDF gerado com sucesso", pdfFile);

      // 2. Upload para UploadThing (usando saveRepertoryLocally diretamente)
      const uploadRes = await saveRepertoryLocally(pdfFile) as { url: string }[];
      console.log("Upload concluído", uploadRes);

      const pdfUrl = uploadRes[0].url;
      console.log("URL do PDF obtida", pdfUrl);

      // 3. Salvar no Banco
      await createSong({
        ...formData,
        pdfUrl,
        lyrics: "Adicione as letras aqui", // Substitua pela lógica correta para obter as letras
      });
      console.log("Música salva com sucesso no banco de dados");

      toast.dismiss(loadingToast);
      toast.success("Música salva no seu repertório!");
      setIsAddingNew(false);
      setFormData({ title: "", artist: "", youtubeUrl: "", sections: [] });
      setNextVerseNumber(1);
      setNextChorusNumber(1);
      setNextBridgeNumber(1);
    } catch (error) {
      console.error("Erro ao salvar música:", error);
      toast.dismiss(loadingToast);
      toast.error("Erro ao salvar música.");
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
      setFormData({
        ...formData,
        sections: [{ 
          id: `verse-${nextVerseNumber}`, 
          type: `Verso ${nextVerseNumber}`, 
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

  const addSection = (type: string, content: string = "") => {
    let sectionType = type;

    if (type === "Verso") {
      sectionType = `Verso ${nextVerseNumber}`;
      setNextVerseNumber(nextVerseNumber + 1);
    } else if (type === "Refrão") {
      sectionType = `Refrão ${nextChorusNumber}`;
      setNextChorusNumber(prev => prev + 1);
    } else if (type === "Ponte") {
      sectionType = `Ponte ${nextBridgeNumber}`;
      setNextBridgeNumber(nextBridgeNumber + 1); // Corrigido para incrementar corretamente
    } else if (type === "Final") {
      sectionType = "Final";
    }

    const newSection = {
      id: `${sectionType.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`,
      type: sectionType,
      content,
      order: formData.sections.length, // Adiciona a ordem para manter a sequência
      color: sectionColors[type.toLowerCase().split(' ')[0]] || sectionColors.verso,
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

      // Ajustar os contadores com base no tipo da seção deletada
      if (sectionToDelete.type.startsWith("Verso")) {
        setNextVerseNumber(updatedSections.filter(sec => sec.type.startsWith("Verso")).length + 1);
      } else if (sectionToDelete.type.startsWith("Refrão")) {
        setNextChorusNumber(updatedSections.filter(sec => sec.type.startsWith("Refrão")).length + 1);
      } else if (sectionToDelete.type.startsWith("Ponte")) {
        setNextBridgeNumber(updatedSections.filter(sec => sec.type.startsWith("Ponte")).length + 1);
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
                  </div>
                </div>
                {formData.sections.length === 0 ? (
                  <p className="text-zinc-500 text-center py-10">Adicione uma seção para começar a escrever a letra.</p>
                ) : (
                  <div className="space-y-4">
                    {formData.sections.map((section, index) => (
                      <div key={section.id} ref={(el) => { sectionRefs.current[section.id] = el; }} className="relative group">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-bold ${section.color}`}>{section.type}</span>
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