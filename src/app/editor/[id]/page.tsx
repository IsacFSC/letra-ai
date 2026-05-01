import { fetchSongById } from "@/app/actions/song-actions";
import { SectionType } from "@prisma/client";

const sectionTypeLabel: Record<SectionType, string> = {
  VERSE: "Verso",
  CHORUS: "Refrão",
  BRIDGE: "Ponte",
  OUTRO: "Final",
  INTRO: "Introdução",
  BUILD: "Construção",
  DROP: "Queda",
};

type AwaitedParams<T> = {
  params: Promise<T>;
};

const SongStagePage = async ({ params }: AwaitedParams<{ id: string }>) => {
  const { id } = await params;

  try {
    const song = await fetchSongById(id);

    if (!song) {
      return <div>Música não encontrada</div>;
    }

    return (
      <main className="p-6 bg-black text-white min-h-screen">
        <h1 className="text-3xl font-bold mb-4">
          {song.title} - {song.artist}
        </h1>

        <div className="space-y-6">
          {(() => {
            let counts: Record<string, number> = { VERSE: 0, CHORUS: 0, BRIDGE: 0, OUTRO: 0, INTRO: 0, BUILD: 0, DROP: 0 };
            return song.sections.map((section) => {
              const type = section.type as SectionType;
              counts[type]++;

              let displayLabel = sectionTypeLabel[type] || type;
              // Number all types except OUTRO, consistent with editor's numbering logic
              if (type !== SectionType.OUTRO && type !== SectionType.INTRO && type !== SectionType.BUILD && type !== SectionType.DROP) {
                displayLabel = `${displayLabel} ${counts[type]}`;
              }

              return (
                <div key={section.id} className="border-b border-gray-700 pb-4">
                  <h2 className={`text-xl font-semibold ${section.color}`}>
                    {displayLabel}
                  </h2>
                  <pre className="whitespace-pre-wrap mt-2 font-mono text-sm leading-relaxed">
                    {section.content}
                  </pre>
                </div>
              );
            });
          })()}
        </div>
      </main>
    );
  } catch (error) {
    console.error(error);
    return <div>Erro ao carregar música</div>;
  }
};

export default SongStagePage;