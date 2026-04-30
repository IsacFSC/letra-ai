import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL é obrigatória" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    const data = await res.json();

    let title = data.title || "";
    let artist = data.author_name || "";

    if (title.includes(" - ")) {
      const parts = title.split(" - ");
      artist = parts[0].trim();
      title = parts[1].trim().replace(/\(.*\)|\[.*\]/g, "").trim();
    }

    return NextResponse.json({ title, artist });
  } catch (error) {
    console.error("Erro ao buscar informações do YouTube:", error);
    return NextResponse.json({ error: "Erro ao processar vídeo" }, { status: 500 });
  }
}