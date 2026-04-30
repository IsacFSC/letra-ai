export interface YoutubeInfo {
  title: string;
  artist: string;
}

export async function fetchYoutubeVideoInfo(youtubeUrl: string) {
  const res = await fetch(`/api/youtube-info?url=${encodeURIComponent(youtubeUrl)}`);
  if (!res.ok) {
    throw new Error("Erro ao buscar informações do YouTube");
  }
  const data = await res.json();

  // Normalizar título e artista
  let title = data.title.replace(/\(.*\)|\[.*\]/g, "").trim(); // Remove "(Ao Vivo)" ou "[Official Video]"
  let artist = data.artist.replace(/ - Topic$/, "").trim(); // Remove " - Topic"

  return { title, artist };
}