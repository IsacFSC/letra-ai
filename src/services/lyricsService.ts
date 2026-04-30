import axios from "axios";

const API_URL = "https://api.lyrics.ovh/v1";

export async function fetchLyrics(
  artist: string,
  title: string,
): Promise<string> {
  try {
    const response = await axios.get(`${API_URL}/${artist}/${title}`);
    return response.data.lyrics;
  } catch (error) {
    console.error("Erro ao buscar letras:", error);
    throw new Error("Não foi possível buscar a letra da música.");
  }
}
