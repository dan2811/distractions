-- AlterTable
ALTER TABLE "Set" ADD COLUMN     "badSongsLimit" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "goodSongsLimit" INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "link" TEXT;
