"use client";

import React from "react";
import { useParams } from "next/navigation";
import { fetchSongById } from "@/app/actions/song-actions";

export default function SongStagePage() {
  const { id } = useParams();
  const [song, setSong] = React.useState<{
    id: string;
    createdAt: Date;
    title: string;
    artist: string | null;
    youtubeUrl: string | null;
    userId: string;
    sections: {
      type: string;
      id: string;
      content: string;
      order: number;
      color: string | null;
      songId: string;
    }[];
  } | null>(null);

  React.useEffect(() => {
    async function loadSong() {
      if (!id) {
        console.error("ID da música não fornecido.");
        return;
      }
      const fetchedSong = await fetchSongById(Array.isArray(id) ? id[0] : id);
      setSong(fetchedSong);
    }
    loadSong();
  }, [id]);

  if (!song) {
    return <div>Carregando...</div>;
  }

  return (
    <main className="p-6 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4">{song.title} - {song.artist}</h1>
      <div className="space-y-6">
        {song.sections.map((section) => (
          <div key={section.id} className="border-b border-gray-700 pb-4">
            <h2 className={`text-xl font-semibold ${section.color}`}>{section.type}</h2>
            <p className="whitespace-pre-wrap mt-2">{section.content}</p>
          </div>
        ))}
      </div>
    </main>
  );
}