import axios from "axios";

const API_URL = "https://api.lyrics.ovh/v1";

export async function fetchLyrics(
  artist: string,
  title: string,
): Promise<string> {
  try {
    const encodedArtist = encodeURIComponent(artist);
    const encodedTitle = encodeURIComponent(title);
    const response = await axios.get(`${API_URL}/${encodedArtist}/${encodedTitle}`);
    return response.data.lyrics;
  } catch (error) {
    console.error("Erro ao buscar letras:", error);
    throw new Error("Não foi possível buscar a letra da música.");
  }
}
