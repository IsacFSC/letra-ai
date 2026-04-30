import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export { prisma };

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciais inválidas");
        }

        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !(await bcrypt.compare(credentials.password, user.passwordHash || ""))) {
          throw new Error("Credenciais inválidas");
        }

        return { id: user.id, email: user.email };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (!session.user) return session;

      if (typeof token.id === "string") {
        session.user.id = token.id;
      }

      if (typeof token.email === "string") {
        session.user.email = token.email;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

// 🔐 usado no SERVER (App Router)
export async function auth() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  return user ?? null;
}