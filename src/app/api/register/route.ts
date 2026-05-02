import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// 🧠 Rate limit simples em memória
const rateLimitMap = new Map<
  string,
  { count: number; lastReset: number }
>();

function checkRateLimit(ip: string, limit = 5, windowMs = 60000) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (now - entry.lastReset > windowMs) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

// ✅ Schema validado corretamente
const schema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Za-z]/, "Deve conter letra")
    .regex(/\d/, "Deve conter número"),
});

export async function POST(req: Request) {
  try {
    // 🌐 Captura IP real
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown";

    // 🚫 Rate limit
    const allowed = checkRateLimit(ip, 5, 60000); // 5 req/min

    if (!allowed) {
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente em instantes." },
        { status: 429 }
      );
    }

    // 📦 Body
    const body = await req.json();
    const { email, password } = schema.parse(body);

    const normalizedEmail = email.toLowerCase().trim();

    // 🔐 Hash
    const passwordHash = await bcrypt.hash(password, 12);

    // 💾 Criação segura (sem race condition)
    try {
      await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
        },
      });
    } catch (err: any) {
      if (err.code === "P2002") {
        return NextResponse.json(
          { error: "Usuário já existe" },
          { status: 409 }
        );
      }
      throw err;
    }

    return NextResponse.json(
      {
        message: "Usuário criado com sucesso",
        email: normalizedEmail,
      },
      { status: 201 }
    );
  } catch (error) {
    // ❌ Erro de validação
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues },
        { status: 422 }
      );
    }

    console.error(error);

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}