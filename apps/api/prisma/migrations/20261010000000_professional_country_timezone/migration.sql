-- Existing professionals are Ethiopian and stay on East Africa Time.
ALTER TABLE "Professional" ADD COLUMN "country" TEXT NOT NULL DEFAULT 'ET';
ALTER TABLE "Professional" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Africa/Addis_Ababa';
