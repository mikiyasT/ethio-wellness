-- CreateEnum
CREATE TYPE "ChangeRequestKind" AS ENUM ('cancel', 'reschedule');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "bookerTimeZone" TEXT,
ADD COLUMN "manageTokenSeal" TEXT,
ADD COLUMN "dailyRoomName" TEXT,
ADD COLUMN "dailyRoomUrl" TEXT,
ADD COLUMN "confirmationSentAt" TIMESTAMPTZ(6),
ADD COLUMN "receiptSentAt" TIMESTAMPTZ(6),
ADD COLUMN "reminder24hSentAt" TIMESTAMPTZ(6),
ADD COLUMN "reminder1hSentAt" TIMESTAMPTZ(6),
ADD COLUMN "reminder5mSentAt" TIMESTAMPTZ(6),
ADD COLUMN "changeRequest" "ChangeRequestKind",
ADD COLUMN "changeRequestSlotId" TEXT,
ADD COLUMN "changeRequestAt" TIMESTAMPTZ(6);

-- CreateIndex
CREATE UNIQUE INDEX "bookings_manageTokenHash_key" ON "bookings"("manageTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_dailyRoomName_key" ON "bookings"("dailyRoomName");
