"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getUserSongs } from "@/app/actions/song-actions"; // Ensure this matches the consolidated name

export default function MySongsPage() {
  const [songs, setSongs] = React.useState<{
    id: string;
    createdAt: Date;
    title: string;
    artist: string | null;
    youtubeUrl: string | null;
    userId: string;
  }[]>([]);

  React.useEffect(() => {
    async function loadSongs() {
      const userSongs = await getUserSongs();
      setSongs(userSongs);
    }
    loadSongs();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Minhas Músicas</h1>
      <ul className="space-y-4">
        {songs.map((song) => (
          <li key={song.id} className="border p-4 rounded-lg">
            <Link href={`/editor/${song.id}`} className="text-lg font-semibold text-blue-600 hover:underline">
              {song.title} - {song.artist}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}