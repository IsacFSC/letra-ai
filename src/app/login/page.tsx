"use client";
import React from "react";
import { signIn } from "next-auth/react";
import { MotionFadeIn } from "src/components/motion-fade-in";
import { BeamEffect } from "src/components/beam-effect";
import { Music2, Mail, Lock, LogIn, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Por favor, verifique seu e-mail e senha e tente novamente.");
      } else {
        toast.success("Login realizado com sucesso!");
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-brand-black relative mx-auto flex min-h-[100svh] w-full items-center justify-center overflow-hidden p-6">
      <BeamEffect />

      <MotionFadeIn>
        <div className="glass-card w-full max-w-md space-y-8 p-8">
          <div className="text-center">
            <div className="inline-flex p-4 bg-brand-green/10 rounded-3xl mb-6 border border-brand-green/20">
              <Music2 className="w-10 h-10 text-brand-green" />
            </div>
            <h1 className="text-4xl font-black text-gradient-gray tracking-tighter">
              Bem-vindo
            </h1>
            <p className="text-zinc-200 mt-2 font-medium">
              Acesse seu repertório e suba ao palco.
            </p>
          </div>

          <form 
            className="w-full max-w-md mx-auto px-4 flex flex-col gap-4" 
            onSubmit={handleLogin}
          >
            {/* Email */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-brand-green transition-colors" />
              <input 
                type="email" 
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-brand-green focus:outline-none text-white placeholder:text-zinc-500 transition"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Senha */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-brand-green transition-colors" />
              <input 
                type="password" 
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-brand-green focus:outline-none text-white placeholder:text-zinc-500 transition"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Botão */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-brand-green hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>ENTRAR <LogIn className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="pt-4 text-center border-t border-white/5">
            <p className="text-zinc-400 text-sm font-medium">
              Ainda não tem conta?{" "}
              <Link 
                href="/register" 
                className="text-brand-green hover:text-green-400 underline-offset-4 hover:underline transition-colors"
              >
                Criar conta gratuita
              </Link>
            </p>
          </div>
        </div>
      </MotionFadeIn>
    </main>
  );
}
