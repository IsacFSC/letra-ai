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

export async function deleteSong(id: string) {
  await prisma.song.delete({
    where: { id },
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

  const userExists = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!userExists) {
    console.warn("Usuário não encontrado. Criando usuário com ID:", user.id);

    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email ?? "", // Garantir que seja uma string
        passwordHash: "default", // Adicionar valor padrão
        createdAt: new Date(),
      },
    });
  }

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

export async function fetchUserSongs() {
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
  return await prisma.song.findUnique({
    where: { id },
    include: {
      sections: true,
    },
  });
}
