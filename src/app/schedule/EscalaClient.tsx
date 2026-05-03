"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Calendar, Plus, Youtube, Clock, Loader2, 
  ExternalLink, Trash2, ArrowLeft, Music2, Check, Search, X
} from "lucide-react";
import toast from "react-hot-toast";
import { MotionFadeIn } from "@/components/motion-fade-in";
import { BeamEffect } from "@/components/beam-effect";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PlaylistSong {
  id: string;
  title: string;
  artist: string | null;
  youtubeUrl?: string | null;
}

interface DailyPlaylist {
  id: string;
  name: string;
  date: string;
  time: string;
  songs: PlaylistSong[];
}

export default function EscalaClient() {
  const [playlists, setPlaylists] = useState<DailyPlaylist[]>([]);
  const [availableSongs, setAvailableSongs] = useState<PlaylistSong[]>([]);
  const [editingPlaylist, setEditingPlaylist] = useState<DailyPlaylist | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPlaylists();
    fetchAvailableSongs();
  }, []);

  const fetchAvailableSongs = async () => {
    const res = await fetch("/api/songs"); // Rota que retorna todas as letras do user
    if (res.ok) setAvailableSongs(await res.json());
  };

  const fetchPlaylists = async () => {
    try {
      const res = await fetch("/api/schedule");
      const data = await res.json();
      if (res.ok) setPlaylists(data);
    } catch {
      toast.error("Erro ao carregar escalas");
    } finally {
      setIsLoading(false);
    }
  };

  const startNewPlaylist = () => {
    const now = new Date();
    setEditingPlaylist({
      id: "",
      name: "Nova Escala",
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      songs: [],
    });
  };

  const saveEscala = async () => {
    if (!editingPlaylist) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPlaylist.id || undefined,
          name: editingPlaylist.name,
          date: editingPlaylist.date,
          time: editingPlaylist.time,
          songs: editingPlaylist.songs.map(s => ({ id: s.id }))
        }),
      });

      if (res.ok) {
        await fetchPlaylists();
        setEditingPlaylist(null);
        toast.success("Escala salva com sucesso!");
      } else {
        toast.error("Erro ao salvar");
      }
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setIsSaving(false);
    }
  };

  const deletePlaylist = async (id: string) => {
    if (!confirm("Excluir esta escala?")) return;

    try {
      const res = await fetch(`/api/schedule/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchPlaylists();
        toast.success("Escala excluída");
      } else {
        toast.error("Erro ao excluir");
      }
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  const toggleSongSelection = (song: PlaylistSong) => {
    if (!editingPlaylist) return;
    const isSelected = editingPlaylist.songs.some(s => s.id === song.id);
    
    setEditingPlaylist({
      ...editingPlaylist,
      songs: isSelected 
        ? editingPlaylist.songs.filter(s => s.id !== song.id)
        : [...editingPlaylist.songs, song]
    });
  };

  const filteredSongs = availableSongs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (song.artist?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  // Renderização da Tela de Edição
  if (editingPlaylist) {
    return (
      <main className="bg-brand-black min-h-screen relative p-6 pb-24">
        <BeamEffect />
        <MotionFadeIn>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setEditingPlaylist(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400"
              >
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-xl font-black text-white uppercase">Editar Escala</h2>
            </div>

            <div className="glass-card p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Nome da Escala</label>
                <input 
                  className="input-field w-full mt-1"
                  value={editingPlaylist.name}
                  onChange={e => setEditingPlaylist({...editingPlaylist, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Data</label>
                  <input 
                    type="date" 
                    className="input-field w-full mt-1"
                    value={editingPlaylist.date}
                    onChange={e => setEditingPlaylist({...editingPlaylist, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Horário</label>
                  <input 
                    type="time" 
                    className="input-field w-full mt-1"
                    value={editingPlaylist.time}
                    onChange={e => setEditingPlaylist({...editingPlaylist, time: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                  <Music2 size={16} /> Músicas Selecionadas ({editingPlaylist.songs.length})
                </h3>
                
                <Dialog onOpenChange={(open) => !open && setSearchTerm("")}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-brand-green/50 text-brand-green hover:bg-brand-green/10 hover:text-brand-green rounded-xl font-bold">
                      <Plus className="mr-2 h-4 w-4" /> SELECIONAR MÚSICAS
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black uppercase tracking-tighter">Escolher Músicas</DialogTitle>
                    </DialogHeader>
                    
                    <div className="relative my-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input 
                        placeholder="Buscar por título ou artista..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-zinc-900 border-white/5 focus-visible:ring-brand-green"
                      />
                    </div>

                    <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {filteredSongs.length > 0 ? (
                        filteredSongs.map(song => {
                          const isSelected = editingPlaylist.songs.some(s => s.id === song.id);
                          return (
                            <div 
                              key={song.id}
                              className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                isSelected ? 'bg-brand-green/5 border-brand-green/30' : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
                              }`}
                              onClick={() => toggleSongSelection(song)}
                            >
                              <Checkbox 
                                checked={isSelected}
                                onCheckedChange={() => toggleSongSelection(song)}
                                className="border-zinc-700 data-[state=checked]:bg-brand-green data-[state=checked]:text-black"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{song.title}</p>
                                <p className="text-xs text-zinc-500 truncate">{song.artist}</p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-center py-8 text-zinc-500 text-sm">Nenhuma música encontrada.</p>
                      )}
                    </div>
                    
                    <DialogFooter className="mt-4">
                      <Button onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}))} className="bg-brand-green text-black font-bold hover:bg-green-400 w-full">
                        CONCLUÍDO
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {editingPlaylist.songs.length === 0 ? (
                <p className="text-xs text-zinc-600 text-center py-4 italic">Nenhuma música selecionada para esta escala.</p>
              ) : (
                <div className="space-y-2">
                  {editingPlaylist.songs.map((song) => (
                    <div key={song.id} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{song.title}</p>
                        <p className="text-xs text-zinc-500 truncate">{song.artist}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => toggleSongSelection(song)}
                        className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={saveEscala}
              disabled={isSaving}
              className="w-full py-1.5 bg-brand-green text-black font-bold rounded-2xl hover:bg-green-400 transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <><Check /> SALVAR ESCALA</>}
            </button>
          </div>
        </MotionFadeIn>
      </main>
    );
  }

  return (
    <main className="bg-brand-black min-h-screen relative p-6 pb-24">
      <BeamEffect />

      <MotionFadeIn>
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between sticky top-0 bg-black/50 py-4 backdrop-blur-md z-10 border-b border-white/5">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard" // Volta para o Dashboard na listagem geral
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft size={24} />
              </Link>

              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Calendar className="text-brand-green" />
                ESCALAS DO DIA
              </h2>
            </div>
          </div>

          {/* Criar */}
          <button
            onClick={startNewPlaylist}
            className="w-full p-6 border-2 border-dashed border-zinc-800 rounded-3xl flex items-center justify-center gap-2 text-zinc-500 hover:border-brand-green hover:text-brand-green transition-all group bg-zinc-900/20"
          >
            <Plus className="group-hover:rotate-90 transition-transform" />
            Criar nova lista de hoje
          </button>

          {/* Conteúdo */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-brand-green w-10 h-10" />
              </div>
            ) : playlists.length === 0 ? (
              <div className="text-center py-20">
                <Music2 className="mx-auto h-12 w-12 text-zinc-700 mb-4" />
                <p className="text-zinc-500 font-medium">
                  Nenhuma escala criada ainda.
                </p>
              </div>
            ) : (
              playlists.map((pl) => (
                <div
                  key={pl.id}
                  className="glass-card overflow-hidden border-white/5 bg-zinc-900/40"
                >
                  {/* Header playlist */}
                  <div 
                    className="p-4 bg-zinc-800/40 border-b border-white/5 flex items-center justify-between cursor-pointer hover:bg-zinc-800/60"
                    onClick={() => setEditingPlaylist(pl)}
                  >
                    <div>
                      <h3 className="font-black text-brand-green uppercase tracking-tight">
                        {pl.name}
                      </h3>

                      <div className="flex gap-4 text-[10px] text-zinc-500 font-bold mt-1">
                        <span className="flex items-center gap-1 uppercase">
                          <Calendar size={12} /> {pl.date}
                        </span>
                        <span className="flex items-center gap-1 uppercase">
                          <Clock size={12} /> {pl.time}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => deletePlaylist(pl.id)}
                      className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Songs */}
                  <div className="p-4 space-y-4">
                    {pl.songs.map((song) => {
                      const embedUrl =
                        song.youtubeUrl &&
                        getYoutubeEmbedUrl(song.youtubeUrl);

                      return (
                        <div
                          key={song.id}
                          className="bg-zinc-950/50 rounded-2xl border border-white/5 p-4"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-white leading-tight">
                                {song.title}
                              </h4>
                              <p className="text-xs text-zinc-500 font-medium">
                                {song.artist}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              {embedUrl && (
                                <button
                                  onClick={() =>
                                    setActiveVideoId(
                                      activeVideoId === song.id
                                        ? null
                                        : song.id
                                    )
                                  }
                                  className={`p-2.5 rounded-xl transition-all ${
                                    activeVideoId === song.id
                                      ? "bg-red-600 text-white"
                                      : "bg-red-600/10 text-red-500 hover:bg-red-600/20"
                                  }`}
                                >
                                  <Youtube size={20} />
                                </button>
                              )}

                              <Link
                                href={`/stage/${song.id}`}
                                className="p-2.5 bg-brand-green/10 text-brand-green rounded-xl hover:bg-brand-green/20 transition-colors"
                              >
                                <ExternalLink size={20} />
                              </Link>
                            </div>
                          </div>

                          {/* Video */}
                          {activeVideoId === song.id && embedUrl && (
                            <div className="mt-4 aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                              <iframe
                                src={`${embedUrl}?autoplay=1`}
                                className="w-full h-full"
                                allow="autoplay; encrypted-media; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </MotionFadeIn>
    </main>
  );
}