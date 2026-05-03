"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Calendar, Plus, Youtube, X, Clock, Loader2,
  ExternalLink, Trash2, ArrowLeft, Music2 
} from "lucide-react";
import toast from "react-hot-toast";
import { MotionFadeIn } from "src/components/motion-fade-in";
import { BeamEffect } from "src/components/beam-effect";

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

export default function EscalaClient() {
  const [playlists, setPlaylists] = useState<DailyPlaylist[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const res = await fetch("/api/escala");
      const data = await res.json();
      if (res.ok) setPlaylists(data);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewPlaylist = async () => {
    const name = prompt("Nome da Escala (ex: Show de Sábado, Ensaio):");
    if (!name) return;
    
    const now = new Date();
    const payload = {
      name,
      date: now.toLocaleDateString('pt-BR'),
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      songs: []
    };

    const res = await fetch("/api/escala", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.ok) fetchPlaylists();
    else toast.error("Erro ao salvar escala");
  };

  const deletePlaylist = async (id: string) => {
    if (confirm("Excluir esta escala?")) {
      const res = await fetch(`/api/escala/${id}`, { method: "DELETE" });
      if (res.ok) fetchPlaylists();
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  return (
    <main className="bg-brand-black min-h-screen relative p-6 pb-24">
      <BeamEffect />
      
      <MotionFadeIn>
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex items-center justify-between sticky top-0 bg-black/50 py-4 backdrop-blur-md z-10 border-b border-white/5">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft size={24} />
              </Link>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Calendar className="text-brand-green" /> ESCALAS DO DIA
              </h2>
            </div>
          </div>

          <button 
            onClick={createNewPlaylist}
            className="w-full p-6 border-2 border-dashed border-zinc-800 rounded-3xl flex items-center justify-center gap-2 text-zinc-500 hover:border-brand-green hover:text-brand-green transition-all group bg-zinc-900/20"
          >
            <Plus className="group-hover:rotate-90 transition-transform" /> Criar nova lista de hoje
          </button>

          <div className="space-y-6">
            {playlists.length === 0 && (
              <div className="text-center py-20">
                <Music2 className="mx-auto h-12 w-12 text-zinc-700 mb-4" />
                <p className="text-zinc-500 font-medium">Nenhuma escala criada ainda.</p>
              </div>
            )}

            {playlists.map(pl => (
              <div key={pl.id} className="glass-card overflow-hidden border-white/5 bg-zinc-900/40">
                <div className="p-4 bg-zinc-800/40 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-brand-green uppercase tracking-tight">{pl.name}</h3>
                    <div className="flex gap-4 text-[10px] text-zinc-500 font-bold mt-1">
                      <span className="flex items-center gap-1 uppercase"><Calendar size={12} /> {pl.date}</span>
                      <span className="flex items-center gap-1 uppercase"><Clock size={12} /> {pl.time}</span>
                    </div>
                  </div>
                  <button onClick={() => deletePlaylist(pl.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {pl.songs.map(song => (
                    <div key={song.id} className="bg-zinc-950/50 rounded-2xl border border-white/5 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-white leading-tight">{song.title}</h4>
                          <p className="text-xs text-zinc-500 font-medium">{song.artist}</p>
                        </div>
                        <div className="flex gap-2">
                          {song.youtubeUrl && (
                            <button 
                              onClick={() => setActiveVideoId(activeVideoId === song.id ? null : song.id)}
                              className={`p-2.5 rounded-xl transition-all ${activeVideoId === song.id ? 'bg-red-600 text-white' : 'bg-red-600/10 text-red-500 hover:bg-red-600/20'}`}
                            >
                              <Youtube size={20} />
                            </button>
                          )}
                          <Link href={`/stage/${song.id}`} className="p-2.5 bg-brand-green/10 text-brand-green rounded-xl hover:bg-brand-green/20 transition-colors">
                            <ExternalLink size={20} />
                          </Link>
                        </div>
                      </div>

                      {activeVideoId === song.id && song.youtubeUrl && (
                        <div className="mt-4 aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                          <iframe
                            src={getYoutubeEmbedUrl(song.youtubeUrl) + "?autoplay=1"}
                            className="w-full h-full"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </MotionFadeIn>
    </main>
  );
}
