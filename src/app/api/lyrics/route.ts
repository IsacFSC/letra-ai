import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchLyrics } from "@/services/lyricsService";

const lyricsSchema = z.object({
  artist: z.string().nonempty("O nome do artista é obrigatório."),
  title: z.string().nonempty("O título da música é obrigatório."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { artist, title } = lyricsSchema.parse(body);

    const lyrics = await fetchLyrics(artist, title);
    return NextResponse.json({ lyrics });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
