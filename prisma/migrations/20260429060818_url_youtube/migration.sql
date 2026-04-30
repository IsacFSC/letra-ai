-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "youtubeUrl" TEXT;

-- CreateTable
CREATE TABLE "Lyrics" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "songId" TEXT NOT NULL,

    CONSTRAINT "Lyrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lyrics_songId_key" ON "Lyrics"("songId");

-- AddForeignKey
ALTER TABLE "Lyrics" ADD CONSTRAINT "Lyrics_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
