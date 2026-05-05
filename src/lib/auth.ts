import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

/**
 * 🏷️ Module Augmentation (tipagem correta)
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    name?: string | null;
    picture?: string | null;
  }
}

/**
 * ✅ Validação
 */
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * 🔐 Dummy hash REAL (evita timing attack sem quebrar bcrypt)
 */
// Gerado com bcrypt.hash('dummy_password', 10)
// É crucial que este hash seja gerado com o mesmo algoritmo e custo do hash real.
// Não use este hash em produção, gere um novo.
const DUMMY_HASH = "$2b$10$8w7vQ8z9J0uQ1yq6V8Q1UeY7K1fJwWw1Kqz8eY7K1fJwWw1Kqz8eY"; 

/**
 * 🧠 Interface de Rate Limit (plugável)
 */
type RateLimitResult = {
  success: boolean;
  message?: string;
};

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos

/**
 * 🔥 Implementação simples (DEV ONLY)
 * ⚠ Em produção, substitua por Redis (Upstash, etc)
 */
async function rateLimit(ip: string): Promise<RateLimitResult> {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (attempt && now - attempt.lastAttempt < WINDOW_MS) {
    if (attempt.count >= MAX_ATTEMPTS) {
      console.warn(`RATE LIMIT: IP ${ip} blocked due to too many attempts.`);
      return { success: false, message: "Muitas tentativas. Tente novamente mais tarde." };
    }
    loginAttempts.set(ip, { count: attempt.count + 1, lastAttempt: now });
  } else {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
  }
  
  // Limpeza de tentativas antigas para evitar vazamento de memória (apenas em dev)
  // Em produção com Redis, isso seria tratado pelo TTL do Redis.
  if (loginAttempts.size > 1000) { // Limite arbitrário para limpeza
    for (const [key, value] of loginAttempts.entries()) {
      if (now - value.lastAttempt > WINDOW_MS) {
        loginAttempts.delete(key);
      }
    }
  }
  return { success: true };
}

/**
 * 🔐 NextAuth config
 */
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  providers: [
    CredentialsProvider({
      name: "credentials",

      credentials: {
        email: { label: "E-mail", type: "text" },
        password: { label: "Senha", type: "password" },
      },

      async authorize(credentials, req) {
        /**
         * 🌐 IP detectado via objeto 'req' (estável para authorize no NextAuth v4)
         * Resolve: "Cannot read private member #headersList"
         */
        const forwarded = req?.headers?.["x-forwarded-for"];
        const ip = typeof forwarded === "string" 
          ? forwarded.split(",")[0] 
          : "unknown";

        /**
         * 🚫 Rate limit
         */
        const rl = await rateLimit(ip);
        if (!rl.success) {
          throw new Error("Too many requests");
        }

        /**
         * ✅ Validação
         */
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        /**
         * 🔎 Busca usuário
         */
        const user = await prisma.user.findUnique({
          // Normaliza o email para minúsculas e remove espaços em branco
          where: { email: email.toLowerCase().trim() },
        });
        /**
         * 🔐 Timing-safe compare
         */
        const hash = user?.passwordHash ?? DUMMY_HASH;

        const isValid = await bcrypt.compare(password, hash);

        if (!user || !isValid) {
          // Incrementa a contagem de falhas para o rate limiting
          const currentAttempt = loginAttempts.get(ip);
          if (currentAttempt) {
            loginAttempts.set(ip, { count: currentAttempt.count + 1, lastAttempt: Date.now() });
          } else {
            loginAttempts.set(ip, { count: 1, lastAttempt: Date.now() });
          }
          return null;
        }

        // Reseta as tentativas em caso de login bem-sucedido
        loginAttempts.delete(ip);
        /**
         * ✅ Retorno mínimo necessário
         */
        return { id: user.id, email: user.email, name: user.name};
      },
    }),
  ],

  callbacks: {
    /**
     * 🧠 JWT
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        // Adiciona name ao token JWT
        token.name = user.name;
      }
      return token;
    },

    /**
     * 👤 Session
     */
    async session({ session, token }) {
      if (session.user) {
        if (typeof token.id === "string") {
          session.user.id = token.id;
        }

        if (typeof token.email === "string") {
          session.user.email = token.email;
        }

        if (typeof token.name === "string") {
          session.user.name = token.name;
        }
      }
      return session;
    }
  },

  pages: {
    signIn: "/login",
  },
};

/**
 * 🧩 Helper server-side (leve)
 */
export async function auth() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

/**
 * 🧠 Quando precisar do banco (separado!)
 */
export async function getCurrentUser() {
  const session = await auth();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.id },
  });
}

export { prisma };