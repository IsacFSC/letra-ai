import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const escalaSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "O nome da escala é obrigatório"),
  date: z.string(), // Data é obrigatória para agendamento
  time: z.string(), // Hora é obrigatória para agendamento
  songs: z.array(z.object({
    id: z.string()
  })).optional(),
});

export async function GET() {
  const user = await auth();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const escalas = await prisma.playlist.findMany({
      where: { userId: user.id },
      include: { 
        songs: { 
          include: { 
            song: true 
          } 
        } 
      },
      orderBy: { createdAt: "desc" },
    });

    // Formata os dados para o frontend (achata o relacionamento PlaylistSong)
    const formatted = escalas.map(pl => ({
      ...pl,
      date: pl.scheduledAt ? pl.scheduledAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      time: pl.scheduledAt ? pl.scheduledAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : "",
      songs: pl.songs.map(ps => ({
        id: ps.song.id,
        title: ps.song.title,
        artist: ps.song.artist,
        youtubeUrl: ps.song.youtubeUrl,
      }))
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar escalas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await auth();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const validatedData = escalaSchema.parse(body);
    
    // Converte data e hora para objeto Date
    const [year, month, day] = validatedData.date.split('-').map(Number);
    const [hour, minute] = validatedData.time.split(':').map(Number);
    const scheduledAt = new Date(year, month - 1, day, hour, minute);

    const result = await prisma.$transaction(async (tx) => {
      if (validatedData.id) {
        const existing = await tx.playlist.findUnique({
          where: { id: validatedData.id, userId: user.id }
        });
        if (!existing) throw new Error("Acesso negado");
        await tx.playlistSong.deleteMany({ where: { playlistId: validatedData.id } });
      }

      const playlist = await tx.playlist.upsert({
        where: { id: validatedData.id || "new-id" },
        update: {
          name: validatedData.name,
          scheduledAt: scheduledAt,
        },
        create: {
          name: validatedData.name,
          userId: user.id,
          scheduledAt: scheduledAt,
        },
      });

      if (validatedData.songs && validatedData.songs.length > 0) {
        await tx.playlistSong.createMany({
          data: validatedData.songs.map((s, index) => ({
            playlistId: playlist.id,
            songId: s.id,
            order: index,
          })),
        });
      }

      return playlist;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao salvar escala" }, { status: 400 });
  }
}
