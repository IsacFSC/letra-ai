import EditorContent from "./EditorClient";
import { fetchSongById } from "@/app/actions/song-actions";

// 👇 tipo correto do Next 15
type PageProps = {
  searchParams?: Promise<{ edit?: string }>;
};

export default async function EditorPage({ searchParams }: PageProps) {
  const params = await searchParams; // 🔥 importante no Next 15

  const editId = params?.edit;

  let song: any = null;

  if (editId) {
    const data = await fetchSongById(editId);

    if (data) {
      song = {
        id: data.id,
        title: data.title,
        artist: data.artist ?? "",
        youtubeUrl: data.youtubeUrl ?? "",
        sections: data.sections.map((sec: any, i: number) => ({
          id: sec.id,
          type: sec.type,
          content: sec.content,
          order: sec.order,
          color: sec.color ?? null,
          label: `${sec.type} ${i + 1}`,
        })),
      };
    }
  }

  return <EditorContent initialSong={song} />;
}