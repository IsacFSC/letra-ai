"use client";

import React, { useState } from "react";
import { MotionFadeIn } from "@/components/motion-fade-in";
import { BeamEffect } from "@/components/beam-effect";
import { Music2, User, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { registerUser } from "@/lib/register";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    try {
      await registerUser(email, password);

      toast.success("Conta criada com sucesso!");

      await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/dashboard",
      });
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  return (
    <main className="bg-brand-black relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden p-6">
      <BeamEffect />

      <MotionFadeIn>
        <div className="glass-card w-full max-w-md space-y-8 p-8">
          <div className="text-center">
            <div className="inline-flex p-4 bg-brand-green/10 rounded-3xl mb-6 border border-brand-green/20">
              <Music2 className="w-10 h-10 text-brand-green" />
            </div>
            <h1 className="text-4xl font-black text-gradient-gray tracking-tighter">
              Letra.AI
            </h1>
            <p className="text-zinc-200 mt-2 font-medium">
              Cadastre-se para gerenciar suas letras.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="space-y-1.5">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-brand-green transition-colors" />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nome de artista"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-brand-green transition-colors" />
                <input
                  type="email"
                  className="input-field"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-brand-green transition-colors" />
                <input
                  type="password"
                  className="input-field"
                  placeholder="Crie uma senha forte"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-brand-green hover:bg-green-400 text-black font-black py-4 rounded-2xl transition-all shadow-[0_10px_30px_rgba(34,197,94,0.2)] active:scale-[0.97] flex items-center justify-center gap-2 mt-4">
              CRIAR CONTA <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="pt-4 text-center border-t border-white/5">
            <p className="text-zinc-400 text-sm font-medium">
              Já possui uma conta?{" "}
              <Link
                href="/login"
                className="text-brand-green hover:text-green-400 underline-offset-4 hover:underline transition-colors"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </MotionFadeIn>
    </main>
  );
}
