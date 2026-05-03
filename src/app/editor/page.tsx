import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditorClient from "./EditorClient";

type PageProps = {
  searchParams?: Promise<{ edit?: string }>;
};

export default async function EditorPage({ searchParams }: PageProps) {
  const user = await auth();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const editId = params?.edit;

  let initialSong: any = null;

  if (editId) {
    // Buscamos a música garantindo que ela pertença ao usuário logado
    // e incluímos as seções ordenadas corretamente
    const songData = await prisma.song.findUnique({
      where: { 
        id: editId,
        userId: user.id 
      },
      include: {
        sections: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (songData) {
      initialSong = {
        id: songData.id,
        title: songData.title,
        artist: songData.artist ?? "",
        youtubeUrl: songData.youtubeUrl ?? "",
        sections: songData.sections.map((sec) => ({
          id: sec.id,
          type: sec.type,
          content: sec.content,
          order: sec.order,
          color: sec.color ?? undefined,
          label: "", // O label (ex: Verso 1) é gerado dinamicamente no EditorClient
        })),
      };
    } else {
      // Se o ID for inválido ou a música não for do usuário, voltamos ao dashboard
      redirect("/dashboard");
    }
  }

  return <EditorClient initialSong={initialSong} />;
}