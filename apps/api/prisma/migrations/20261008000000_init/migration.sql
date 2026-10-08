-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('client', 'professional');

-- CreateEnum
CREATE TYPE "ProfessionalStatus" AS ENUM ('pending', 'approved');

-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('open', 'closed', 'booked', 'held');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('held', 'upcoming', 'cancelled', 'completed');

-- CreateEnum
CREATE TYPE "CancelledBy" AS ENUM ('client', 'professional', 'guest', 'system');

-- CreateEnum
CREATE TYPE "LinkState" AS ENUM ('ready', 'pending');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Professional" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "credentials" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL,
    "practiceMore" TEXT NOT NULL DEFAULT '',
    "languages" TEXT[],
    "specialties" TEXT[],
    "feeCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "avatarClass" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "photoUrl" TEXT,
    "status" "ProfessionalStatus" NOT NULL,
    "rating" DECIMAL(3,1),
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Professional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slot" (
    "id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "startsAt" TIMESTAMPTZ(6) NOT NULL,
    "endsAt" TIMESTAMPTZ(6) NOT NULL,
    "status" "SlotStatus" NOT NULL,
    "holdExpiresAt" TIMESTAMPTZ(6),
    "holdBookingId" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "professionalId" TEXT NOT NULL,
    "slot_id" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "feeCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "BookingStatus" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "holdExpiresAt" TIMESTAMPTZ(6),
    "sessionCode" TEXT,
    "manageTokenHash" TEXT,
    "joinTokenHash" TEXT,
    "checkoutSessionId" TEXT,
    "paymentIntentId" TEXT,
    "linkState" "LinkState",
    "cancelledBy" "CancelledBy",
    "guestFirstName" TEXT,
    "guestLastName" TEXT,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "guestNote" TEXT,
    "claimedAt" TIMESTAMPTZ(6),

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Professional_userId_key" ON "Professional"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Professional_slug_key" ON "Professional"("slug");

-- CreateIndex
CREATE INDEX "Slot_professionalId_status_startsAt_idx" ON "Slot"("professionalId", "status", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Slot_professionalId_startsAt_key" ON "Slot"("professionalId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_sessionCode_key" ON "bookings"("sessionCode");

-- CreateIndex
CREATE INDEX "bookings_guestEmail_idx" ON "bookings"("guestEmail");

-- CreateIndex
CREATE INDEX "bookings_sessionCode_guestEmail_idx" ON "bookings"("sessionCode", "guestEmail");

-- CreateIndex
CREATE INDEX "bookings_professionalId_status_idx" ON "bookings"("professionalId", "status");

-- CreateIndex
CREATE INDEX "bookings_clientId_idx" ON "bookings"("clientId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Professional" ADD CONSTRAINT "Professional_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "Slot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- One upcoming booking per slot. Prisma cannot express partial unique indexes.
CREATE UNIQUE INDEX "bookings_one_upcoming_per_slot" ON "bookings" ("slot_id") WHERE "status" = 'upcoming'::"BookingStatus";
