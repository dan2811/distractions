-- DropIndex
DROP INDEX "Job_id_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastSignIn" TIMESTAMP(3);
