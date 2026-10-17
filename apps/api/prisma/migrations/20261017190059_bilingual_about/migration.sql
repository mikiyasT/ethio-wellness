-- CreateEnum
CREATE TYPE "AboutLang" AS ENUM ('am', 'om', 'ti');

-- AlterTable
ALTER TABLE "Professional" ADD COLUMN     "aboutTranslated" TEXT,
ADD COLUMN     "aboutTranslatedLang" "AboutLang";
