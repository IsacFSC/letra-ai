// app/api/song/save/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(req: NextRequest) {
  try {
    // 1. Verificação de Segurança (Autenticação)
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, artist, youtubeUrl, sections } = body;

    // 2. Validação de dados obrigatórios
    if (!title) {
      return NextResponse.json(
        { error: "O título da música é obrigatório" },
        { status: 400 }
      );
    }

    // 3. Buscar o usuário no banco para vincular a música
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // 4. Operação Atômica no Banco de Dados
    const result = await prisma.$transaction(async (tx) => {
      // Se for uma atualização, limpamos as seções existentes para reinseri-las na nova ordem
      if (id) {
        await tx.section.deleteMany({ where: { songId: id } });
      }

      const data = {
        title,
        artist: artist || "",
        youtubeUrl: youtubeUrl || "",
        userId: user.id,
        sections: {
          create: (sections || []).map((s: any, index: number) => ({
            type: s.type,
            content: s.content,
            order: index, // Preserva a posição definida no editor
            color: s.color || "", // Salva a cor (seja a fixa ou a baseada no tipo)
          })),
        },
      };

      if (id) {
        return await tx.song.update({
          where: { id },
          data,
        });
      } else {
        return await tx.song.create({
          data,
        });
      }
    });

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error("[SAVE_SONG_ERROR]:", error);
    return NextResponse.json({ error: "Erro ao salvar no banco de dados" }, { status: 500 });
  }
}