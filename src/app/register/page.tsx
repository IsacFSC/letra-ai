"use client";

import React, { useState } from "react";
import { MotionFadeIn } from "@/components/motion-fade-in";
import { BeamEffect } from "@/components/beam-effect";
import { Music2, User, Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { registerUser } from "@/lib/register";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 🔒 regras alinhadas com backend
  const passwordRules = {
    minLength: password.length >= 8,
    hasLetter: /[A-Za-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const isPasswordValid =
    passwordRules.minLength &&
    passwordRules.hasLetter &&
    passwordRules.hasNumber;

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const isFormValid =
    name && email && isPasswordValid && passwordsMatch;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (!isPasswordValid) {
      return toast.error("Senha inválida.");
    }

    if (!passwordsMatch) {
      return toast.error("As senhas não coincidem.");
    }

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
            
            {/* Nome */}
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-brand-green" />
              <input
                type="text"
                className="input-field w-full pl-12"
                placeholder="Nome de artista"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-brand-green" />
              <input
                type="email"
                className="input-field w-full pl-12"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-brand-green" />
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input-field w-full pl-12 pr-12 ${
                    password && !isPasswordValid && "border-red-500"
                  }`}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Feedback */}
              <div className="text-xs space-y-1">
                <p className={passwordRules.minLength ? "text-green-500" : "text-zinc-500"}>
                  • Pelo menos 8 caracteres
                </p>
                <p className={passwordRules.hasLetter ? "text-green-500" : "text-zinc-500"}>
                  • Contém letra
                </p>
                <p className={passwordRules.hasNumber ? "text-green-500" : "text-zinc-500"}>
                  • Contém número
                </p>
              </div>
            </div>

            {/* Confirmar senha */}
            <div className="space-y-1">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-brand-green" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`input-field w-full pl-12 pr-12 ${
                    confirmPassword && !passwordsMatch && "border-red-500"
                  }`}
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {confirmPassword && (
                <p className={`text-xs ${passwordsMatch ? "text-green-500" : "text-red-500"}`}>
                  {passwordsMatch
                    ? "As senhas coincidem"
                    : "As senhas não coincidem"}
                </p>
              )}
            </div>

            {/* Botão */}
            <button 
              type="submit" 
              disabled={!isFormValid || isLoading}
              className="w-full bg-brand-green hover:bg-green-400 disabled:opacity-80 text-black font-black py-4 rounded-2xl transition-all shadow-[0_10px_30px_rgba(34,197,94,0.2)] active:scale-[0.97] flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  CRIAR CONTA <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 text-center border-t border-white/5">
            <p className="text-zinc-400 text-sm font-medium">
              Já possui uma conta?{" "}
              <Link
                href="/login"
                className="text-brand-green hover:text-green-400 underline-offset-4 hover:underline"
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