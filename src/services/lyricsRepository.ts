import { prisma } from "@/lib/prisma";

export async function saveLyrics(songId: string, content: string) {
  return prisma.lyrics.create({
    data: {
      songId,
      content,
    },
  });
}

export async function getLyricsByUser(userId: string) {
  return prisma.lyrics.findMany({
    where: {
      song: {
        userId: userId,
      },
    },
    include: {
      song: true,
    },
  });
}
