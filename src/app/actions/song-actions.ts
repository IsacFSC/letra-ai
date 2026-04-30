"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SectionType } from "@prisma/client";
import { auth } from "@/lib/auth"; // Importar função de autenticação

// Função auxiliar para converter o nome da seção para o Enum do Prisma
const mapToSectionType = (type: string): SectionType => {
  const lower = type.toLowerCase();
  if (lower.includes("verso")) return SectionType.VERSE;
  if (lower.includes("refrão")) return SectionType.CHORUS;
  if (lower.includes("ponte")) return SectionType.BRIDGE;
  if (lower.includes("final")) return SectionType.OUTRO;
  return SectionType.VERSE;
};

export async function deleteSong(id: string) {
  const user = await auth();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  await prisma.song.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
}

export async function createSong(data: {
  title: string;
  artist: string;
  youtubeUrl?: string;
  pdfUrl?: string;
  sections: { id: string; type: string; content: string; order: number; color?: string }[];
  lyrics: string;
}) {
  const user = await auth(); // Obter usuário autenticado
  if (!user) {
    throw new Error("Usuário não autenticado. Faça login para continuar.");
  }

  const userExists = await prisma.user.findFirst({
    where: { id: user.id },
  });


  const song = await prisma.song.create({
    data: {
      title: data.title,
      artist: data.artist,
      youtubeUrl: data.youtubeUrl,
      userId: user.id,
      lyrics: {
        create: {
          content: data.lyrics,
        },
      },
      sections: {
        create: data.sections.map((section) => ({
          type: mapToSectionType(section.type), // Mapear para o enum SectionType
          content: section.content,
          order: section.order,
          color: section.color,
        })),
      },
    },
  });

  revalidatePath("/dashboard");
  return song;
}

export async function getUserSongs() {
  const user = await auth();
  if (!user) {
    throw new Error("Usuário não autenticado. Faça login para continuar.");
  }

  return await prisma.song.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function fetchSongById(id: string) {
  const user = await auth();
  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const song = await prisma.song.findFirst({
    where: { 
      id,
      userId: user.id // Ensure the user owns the song
    },
    include: {
      sections: true,
    },
  });

  if (!song) {
    throw new Error("Música não encontrada ou acesso negado.");
  }

  return song;
}
