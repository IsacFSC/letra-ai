"use client";

import React, { useState } from "react";
import { MotionFadeIn } from "@/components/motion-fade-in";
import { BeamEffect } from "@/components/beam-effect";
import { Music2, UserCircle, LogOut, Trash2, Edit3, Key, Plus } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { deleteSong } from "@/app/actions/song-actions";

interface DashboardClientProps {
  user: { email: string | null };
  initialSongs: any[];
}

export default function DashboardClient({ user, initialSongs }: DashboardClientProps) {
  const [tab, setTab] = useState<"songs" | "profile">("songs");
  const [songs, setSongs] = useState(initialSongs);

  const handleDelete = async (id: string) => {
    try {
      await deleteSong(id);
      setSongs(songs.filter((s) => s.id !== id));
      toast.success("Música removida!");
    } catch (error) {
      toast.error("Erro ao excluir.");
    }
  };

  return (
    <main className="bg-brand-black relative flex min-h-svh w-full flex-col overflow-hidden">
      <BeamEffect />
      <MotionFadeIn>
        <nav className="border-white/5 sticky top-0 z-10 flex w-full items-center justify-between border-b bg-zinc-900/50 p-4 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <Music2 className="text-brand-green h-7 w-7" />
            <h2 className="text-gradient-gray text-2xl font-black tracking-tighter">Letra.AI</h2>
          </div>
          <button onClick={() => toast.error("Logout simulado")} className="text-zinc-400 hover:text-red-400 transition-colors">
            <LogOut className="h-6 w-6" />
          </button>
        </nav>

        <div className="flex-1 p-6 pb-32">
          <div className="mb-8 flex gap-4 border-b border-white/5 pb-2">
            <button 
              onClick={() => setTab("songs")}
              className={`text-lg font-bold transition-colors ${tab === "songs" ? "text-brand-green border-b-2 border-brand-green" : "text-zinc-500"}`}
            >
              Minhas Músicas
            </button>
            <button 
              onClick={() => setTab("profile")}
              className={`text-lg font-bold transition-colors ${tab === "profile" ? "text-brand-green border-b-2 border-brand-green" : "text-zinc-500"}`}
            >
              Meu Perfil
            </button>
          </div>

          {tab === "songs" ? (
            <div className="grid gap-4">
              {songs.length === 0 ? (
                <p className="text-zinc-500 text-center py-10">Nenhuma música salva ainda.</p>
              ) : (
                songs.map((song) => (
                  <div key={song.id} className="glass-card flex items-center justify-between p-5">
                    <div className="flex flex-col">
                      <h3 className="font-bold text-white text-lg">{song.title}</h3>
                      <p className="text-zinc-500">{song.artist}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/editor/${song.id}`} className="p-2 bg-white/5 rounded-lg hover:text-brand-green transition-colors">
                        <Edit3 className="h-5 w-5" />
                      </Link>
                      <button onClick={() => handleDelete(song.id)} className="p-2 bg-white/5 rounded-lg hover:text-red-500 transition-colors">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="glass-card p-8 max-w-md mx-auto space-y-6">
              <div className="flex flex-col items-center gap-4 mb-4">
                <div className="p-4 bg-brand-green/10 rounded-full border border-brand-green/20 text-brand-green">
                  <UserCircle className="h-16 w-16" />
                </div>
                <p className="text-zinc-400">{user.email}</p>
              </div>
              
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Senha atualizada!"); }}>
                <h3 className="text-xl font-bold flex items-center gap-2"><Key className="h-5 w-5" /> Alterar Senha</h3>
                <input type="password" placeholder="Senha Atual" className="input-field" required />
                <input type="password" placeholder="Nova Senha" className="input-field" required />
                <button type="submit" className="w-full bg-brand-green text-black font-black py-3 rounded-xl hover:bg-green-400 transition-all">
                  ATUALIZAR SENHA
                </button>
              </form>
            </div>
          )}
        </div>
      </MotionFadeIn>

      {/* Floating Action Button para Nova Música */}
      <Link href="/editor?new=true" className="bg-brand-green fixed bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-8 py-4 font-black text-black shadow-[0_10px_30px_rgba(34,197,94,0.4)] transition-all hover:scale-110 active:scale-95 z-50">
        <Plus className="h-6 w-6" /> NOVA MÚSICA
      </Link>
    </main>
  );
}