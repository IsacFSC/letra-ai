import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) return NextResponse.json({ error: "URL é obrigatória" }, { status: 400 });

  try {
    // Busca info básica via oEmbed do YouTube
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    const data = await res.json();
    
    let title = data.title || "";
    let artist = data.author_name || "";

    // Tentativa simples de separar Artista - Título se o título do vídeo seguir esse padrão comum
    if (title.includes(" - ")) {
      const parts = title.split(" - ");
      // Se houver "Official Video" etc, poderíamos limpar aqui, mas vamos manter simples
      artist = parts[0].trim();
      title = parts[1].trim().replace(/\(.*\)|\[.*\]/g, "").trim(); // Remove (Official Video) etc
    }

    return NextResponse.json({ title, artist });
  } catch (error) {
    console.error("YouTube info fetch error:", error);
    return NextResponse.json({ error: "Erro ao processar vídeo" }, { status: 500 });
  }
}