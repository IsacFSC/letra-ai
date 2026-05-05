import { MotionFadeIn } from "@/components/motion-fade-in";
import { BeamEffect } from "@/components/beam-effect";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Letra.AI - Sua Plataforma de Repertório",
  description: "Organize seu repertório musical e brilhe no palco.",
  openGraph: {
    title: "Letra.AI",
    description: "A plataforma definitiva para cantores e músicos.",
    url: "https://letra-ai.vercel.app/",
    siteName: "Letra.AI",
    images: [{ url: "https://letra-ai.vercel.app/brand/letra-ai-icon.png", width: 1024, height: 1024 }],
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <main className="bg-brand-black relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden p-6">
      <BeamEffect />

      <MotionFadeIn>
        <div className="w-full max-w-2xl space-y-8 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-brand-green/20 bg-brand-green/10 px-4 py-2 text-sm font-bold text-brand-green">
            <Star className="h-4 w-4 fill-brand-green" /> Para ensaios e palcos ao vivo
          </div>
          
          <h1 className="text-gradient-gray block text-6xl font-black leading-tight tracking-tighter md:text-8xl">
            Letra.AI
          </h1>
          
          <p className="mx-auto max-w-lg text-lg font-medium text-zinc-200 md:text-xl">
            A plataforma definitiva para cantores organizarem seu repertório e brilharem no palco com alta performance.
          </p>

          <div className="flex w-full flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Link 
              href="/register" 
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-green px-10 py-4 font-black text-black shadow-[0_10px_30px_rgba(34,197,94,0.3)] transition-all hover:bg-green-400 active:scale-95 sm:w-auto"
            >
              COMEÇAR AGORA <ArrowRight className="h-5 w-5" />
            </Link>
            
            <Link 
              href="/login" 
              className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-10 py-4 font-bold text-white transition-all hover:bg-white/10 active:scale-95 sm:w-auto"
            >
              ENTRAR
            </Link>
          </div>

          <p className="pt-8 text-sm font-medium text-zinc-500">
            Disponível offline para performances sem interrupções.
          </p>
        </div>
      </MotionFadeIn>
    </main>
  );
}
