/*
  Warnings:

  - You are about to drop the column `color` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `lyricsId` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lyrics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `Section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `songId` to the `Section` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Section` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('VERSE', 'CHORUS', 'BRIDGE', 'INTRO', 'OUTRO', 'BUILD', 'DROP');

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Lyrics" DROP CONSTRAINT "Lyrics_songId_fkey";

-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_lyricsId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- AlterTable
ALTER TABLE "Section" DROP COLUMN "color",
DROP COLUMN "lyricsId",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "songId" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "SectionType" NOT NULL;

-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "artist" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
DROP COLUMN "image",
DROP COLUMN "name",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "email" SET NOT NULL;

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Lyrics";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "VerificationToken";

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
