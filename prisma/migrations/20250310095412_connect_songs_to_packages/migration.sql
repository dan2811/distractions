-- CreateTable
CREATE TABLE "_PackageToSong" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PackageToSong_AB_unique" ON "_PackageToSong"("A", "B");

-- CreateIndex
CREATE INDEX "_PackageToSong_B_index" ON "_PackageToSong"("B");

-- AddForeignKey
ALTER TABLE "_PackageToSong" ADD CONSTRAINT "_PackageToSong_A_fkey" FOREIGN KEY ("A") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PackageToSong" ADD CONSTRAINT "_PackageToSong_B_fkey" FOREIGN KEY ("B") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
