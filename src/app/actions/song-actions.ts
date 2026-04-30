"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SectionType } from "@prisma/client";
import { auth } from "@/lib/auth";

/* =========================
   🔐 AUTH HELPER CENTRAL
========================= */
async function requireUser() {
  const user = await auth();

  if (!user?.id) {
    throw new Error("Usuário não autenticado.");
  }

  return user;
}

/* =========================
   🎵 SECTION MAPPER
========================= */
const sectionMap: Record<string, SectionType> = {
  verso: SectionType.VERSE,
  refrão: SectionType.CHORUS,
  ponte: SectionType.BRIDGE,
  final: SectionType.OUTRO,
};

function mapToSectionType(type: string): SectionType {
  const key = type.toLowerCase();

  return (
    Object.entries(sectionMap).find(([k]) => key.includes(k))?.[1] ??
    SectionType.VERSE
  );
}

/* =========================
   🗑 DELETE SONG
========================= */
export async function deleteSong(id: string) {
  const user = await requireUser();

  await prisma.song.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
}

/* =========================
   🎼 CREATE SONG
========================= */
export async function createSong(data: {
  title: string;
  artist: string;
  youtubeUrl?: string;
  pdfUrl?: string;
  sections: {
    id: string;
    type: string;
    content: string;
    order: number;
    color?: string;
  }[];
  lyrics: string;
}) {
  const user = await requireUser();

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
          type: mapToSectionType(section.type),
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

/* =========================
   📚 GET USER SONGS
========================= */
export async function getUserSongs() {
  const user = await requireUser();

  return prisma.song.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

/* =========================
   🔍 FETCH SONG BY ID
========================= */
export async function fetchSongById(id: string) {
  const user = await requireUser();

  const song = await prisma.song.findFirst({
    where: {
      id,
      userId: user.id,
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