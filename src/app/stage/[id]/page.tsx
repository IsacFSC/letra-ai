import { prisma } from "@/lib/prisma";
import StagePageClient from "./stageClient";

type AwaitedParams<T> = {
  params: Promise<T>;
};

const StagePage = async ({ params }: AwaitedParams<{ id: string }>) => {
  const { id } = await params;

  const song = await prisma.song.findFirst({
    where: { id },
    include: {
      sections: true,
    },
  });

  if (!song) {
    return (
      <div className="flex h-screen items-center justify-center text-white bg-black">
        Música não encontrada
      </div>
    );
  }

  const formattedSong = {
    id: song.id,
    title: song.title || "",
    artist: song.artist || "",
    youtubeUrl: song.youtubeUrl || null,
    sections: song.sections.map((sec) => ({
      id: sec.id,
      type: sec.type,
      content: sec.content,
    })),
  };

  return <StagePageClient song={formattedSong} />;
};

export default StagePage;