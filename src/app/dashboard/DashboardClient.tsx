"use client";

import React, { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { MotionFadeIn } from "@/components/motion-fade-in";
import { BeamEffect } from "@/components/beam-effect";
import { Music2, UserCircle, LogOut, Trash2, Edit3, Key, Plus, MicVocal, FileMinus, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { deleteSong, getUserSongs } from "@/app/actions/song-actions";

type Song = {
  id: string;
  title: string;
  artist: string | null;
};

interface DashboardClientProps {
  user: { email: string | null };
  initialSongs: Song[];
}

export default function DashboardClient({ user, initialSongs }: DashboardClientProps) {
  const [tab, setTab] = useState<"songs" | "escalas" | "profile">("songs");
  const [songs, setSongs] = useState(initialSongs);
  const [escalas, setEscalas] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza?")) return;

    setLoadingId(id);

    try {
      await deleteSong(id);
      setSongs((prev) => prev.filter((s) => s.id !== id));
      toast.success("Música removida!");
    } catch {
      toast.error("Erro ao excluir.");
    } finally {
      setLoadingId(null);
    }
  };

  const fetchSongs = async (append = false) => {
    setLoading(true);
    try {
      const newSongs = await getUserSongs({
        search,
        skip: append ? songs.length : 0,
        take: 10,
      });
      setSongs((prev) => (append ? [...prev, ...newSongs] : newSongs));
      setHasMore(newSongs.length === 10);
    } catch {
      toast.error("Erro ao carregar músicas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [search]);

  useEffect(() => {
    if (tab === "escalas") {
      setLoading(true);
      fetch("/api/schedule").then(res => res.json()).then(data => { setEscalas(data); setLoading(false); });
    }
  }, [tab]);

  return (
    <main className="bg-brand-black relative flex min-h-svh w-full flex-col overflow-hidden">
      <BeamEffect />
      <MotionFadeIn>
        <nav className="border-white/10 sticky top-0 z-10 flex w-full items-center justify-between border-b bg-zinc-900/50 p-4 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <Music2 className="text-brand-green h-7 w-7" />
            <h2 className="text-gradient-gray text-2xl font-black tracking-tighter">Letra.AI</h2>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })} title="Sair" className="text-zinc-400 hover:text-red-400 transition-colors">
            <LogOut className="h-6 w-6" />
          </button>
        </nav>

        <div className="flex-1 w-full p-2 pb-32">
          <div className="mb-8 flex gap-4 border-b border-white/5 pb-2">
            <button 
              onClick={() => setTab("songs")}
              className={`text-lg font-bold transition-colors ${tab === "songs" ? "text-brand-green border-b-2 border-brand-green" : "text-zinc-500"}`}
            >
              Minhas Músicas
            </button>
            <button 
              onClick={() => setTab("escalas")}
              className={`text-lg font-bold transition-colors ${tab === "escalas" ? "text-brand-green border-b-2 border-brand-green" : "text-zinc-500"}`}
            >
              Escalas
            </button>
            <button 
              onClick={() => setTab("profile")}
              className={`text-lg font-bold transition-colors ${tab === "profile" ? "text-brand-green border-b-2 border-brand-green" : "text-zinc-500"}`}
            >
              Meu Perfil
            </button>
          </div>

          {tab === "songs" && (
            <div className="grid gap-4">
              <div className="relative group items-center flex">
                <FileMinus className=" absolute left-4 top-1/3 -translate-y-1/3 w-5 h-5 text-zinc-400 group-focus-within:text-brand-green transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar músicas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field w-full mx-auto"
                />
              </div>
              {songs.length === 0 ? (
                <p className="text-zinc-500 text-center py-10">Nenhuma música encontrada.</p>
              ) : (
                songs.map((song) => (
                  <div key={song.id} className="glass-card flex items-center justify-between p-5">
                    <div className="flex flex-col justify-center items-center">
                      <h3 className="font-bold text-white text-lg pr-3 line-clamp-1">{song.title}</h3>
                      <p className="text-zinc-500 pr-3 line-clamp-1">{song.artist}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/stage/${song.id}`}
                        className="p-2 bg-brand-green/20 text-brand-green rounded-lg hover:bg-brand-green/30"
                      >
                        <MicVocal />
                      </Link>
                      <Link href={`/editor?edit=${song.id}`} title="Editar Letra" className="p-2 bg-white/10 hover:bg-white/8 rounded-lg hover:text-blue-400 transition-colors">
                        <Edit3 className="h-5 w-5" />
                      </Link>
                      <button onClick={() => handleDelete(song.id)} className="p-2 bg-white/10 hover:bg-white/8 rounded-lg hover:text-red-500 transition-colors" disabled={loadingId === song.id}>
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
              {hasMore && (
                <button
                  onClick={() => fetchSongs(true)}
                  disabled={loading}
                  className="text-green-500 border-b-2 border-green-500 mx-auto font-light transition-all mt-4"
                >
                  {loading ? "Carregando..." : "Exibir mais"}
                </button>
              )}
            </div>
          )}

          {tab === "escalas" && (
            <div className="space-y-4">
              <Link href="/schedule" className="flex items-center justify-center gap-2 p-4 bg-brand-green/10 border border-brand-green/20 rounded-2xl text-brand-green font-bold hover:bg-brand-green/20 transition-all">
                <Plus size={20} /> GERENCIAR TODAS AS ESCALAS
              </Link>
              
              {loading ? (
                <div className="flex justify-center py-10"><Calendar className="animate-bounce text-zinc-700" /></div>
              ) : escalas.length === 0 ? (
                <p className="text-zinc-500 text-center py-10">Nenhuma escala para hoje.</p>
              ) : (
                escalas.map((escala) => (
                  <div key={escala.id} className="glass-card p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white uppercase">{escala.name}</h3>
                      <p className="text-xs text-zinc-500">{escala.songs?.length || 0} músicas selecionadas</p>
                    </div>
                    <Link 
                      href="/schedule" 
                      className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-zinc-400"
                    >
                      <ArrowRight size={20} />
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "profile" && (
            <div className="glass-card p-8 max-w-md mx-auto space-y-6">
              <div className="flex flex-col items-center gap-4 mb-4">
                <div className="p-4 bg-brand-green/10 rounded-full border border-brand-green/20 text-brand-green">
                  <UserCircle className="h-16 w-16" />
                </div>
                <p className="text-zinc-400">{user.email}</p>
              </div>
              <form className="space-y-4 mx-auto" onSubmit={(e) => { e.preventDefault(); toast.success("Senha atualizada!"); }}>
                <h3 className="text-xl font-bold flex mx-auto justify-center items-center gap-2"><Key className="h-5 w-5" /> Alterar Senha</h3>
                <input type="password" placeholder="Senha Atual" className="w-full max-w-xs mx-auto block input-field" required />
                <input type="password" placeholder="Nova Senha" className="w-full max-w-xs mx-auto block input-field" required />
                <button type="submit" className="max-w-xs mx-auto px-1.5 bg-brand-green text-black font-bold py-2 rounded-xl hover:bg-green-400 transition-all block">
                  ATUALIZAR SENHA
                </button>
              </form>
            </div>
          )}
        </div>
      </MotionFadeIn>

      {/* Floating Action Button para Nova Música */}
      <div className="fixed bottom-10 left-1/2 transform mx-auto text-center -translate-x-1/2 z-50 items-center justify-center">
        <Link href="/editor?new=true" className="bg-brand-green flex items-center justify-center gap-2 rounded-4xl px-2 py-2.5 font-black text-black shadow-md shadow-green-500/50 hover:bg-green-400 transition-all">
          <Plus className="h-6 w-6" /> NOVA MÚSICA
        </Link>
      </div>
    </main>
  );
}