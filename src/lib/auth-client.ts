import { signIn } from "next-auth/react";

export async function handleLogin(email: string, password: string) {
  const res = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  if (res?.error) {
    throw new Error("Credenciais inválidas");
  }

  window.location.href = "/dashboard";
}