import { createHash } from "node:crypto";
import {
  availabilitySlots,
  professionals,
  type AvailabilitySlot,
} from "@ethio-wellness/shared";
import { Prisma, PrismaClient, type SlotStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

/** Shared password for every seeded user. Documented in the README. */
export const DEMO_PASSWORD = "AyzonDemo!2026";

const FEE_CENTS = 2500;
const EAT = "Africa/Addis_Ababa";
const EXTRA_HOURS = ["10:00 AM", "1:00 PM", "5:00 PM"] as const;

const prisma = new PrismaClient();

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function eatTodayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: EAT,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function addDays(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day!));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function eatWeekdayIndex(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, day!)).getUTCDay();
}

/** Sample labels ("Today", "Fri") are calendar days in East Africa Time. */
function resolveSampleDate(label: string, todayIso: string): string {
  const lower = label.toLowerCase();
  if (lower === "today") return todayIso;
  if (lower === "tomorrow") return addDays(todayIso, 1);
  const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const idx = weekdays.findIndex((day) => lower.startsWith(day));
  if (idx >= 0) {
    const delta = (idx - eatWeekdayIndex(todayIso) + 7) % 7 || 7;
    return addDays(todayIso, delta);
  }
  return todayIso;
}

/** Wall-clock time on an EAT calendar date → UTC instant. EAT is UTC+3 year-round. */
function startsAtFromEat(dateIso: string, timeLabel: string): Date {
  const match = timeLabel.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  let hours = 12;
  let minutes = 0;
  if (match) {
    hours = Number(match[1]);
    minutes = Number(match[2]);
    const ampm = match[3]!.toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
  }
  return new Date(
    Date.UTC(
      Number(dateIso.slice(0, 4)),
      Number(dateIso.slice(5, 7)) - 1,
      Number(dateIso.slice(8, 10)),
      hours - 3,
      minutes,
      0,
    ),
  );
}

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const todayIso = eatTodayIso();

  await prisma.booking.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.session.deleteMany();
  await prisma.professional.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      id: "user-abel",
      name: "Abel Desta",
      email: "abel@example.com",
      passwordHash,
      role: "client",
    },
  });
  await prisma.user.create({
    data: {
      id: "user-test-client",
      name: "Test Client",
      email: "test.client@example.com",
      passwordHash,
      role: "client",
    },
  });

  for (const pro of professionals) {
    const userId = `user-${pro.slug}`;
    await prisma.user.create({
      data: {
        id: userId,
        name: pro.name,
        email: `${pro.slug}@example.com`,
        passwordHash,
        role: "professional",
      },
    });
    await prisma.professional.create({
      data: {
        id: pro.id,
        userId,
        slug: pro.slug,
        name: pro.name,
        title: pro.title,
        city: pro.city,
        credentials: "",
        bio: pro.bio,
        practiceMore: "",
        languages: [...pro.languages],
        specialties: [...pro.specialties],
        feeCents: FEE_CENTS,
        currency: "usd",
        avatarClass: pro.avatarClass,
        initials: pro.initials,
        photoUrl: pro.photoUrl,
        status: "approved",
        rating: new Prisma.Decimal(pro.rating),
        reviewCount: pro.reviewCount,
      },
    });
  }

  await prisma.user.create({
    data: {
      id: "user-test-provider",
      name: "Test Provider",
      email: "test.provider@example.com",
      passwordHash,
      role: "professional",
    },
  });
  await prisma.professional.create({
    data: {
      id: "pro-test-provider",
      userId: "user-test-provider",
      slug: "test-provider",
      name: "Test Provider",
      title: "Licensed Counselor",
      city: "Addis Ababa",
      credentials: "Demo credentials",
      bio: "Pending demo provider. Approve with ADMIN_TOKEN before this profile is public.",
      practiceMore: "",
      languages: ["amharic", "english"],
      specialties: ["individual-mental-health", "career-and-life-stress"],
      feeCents: FEE_CENTS,
      currency: "usd",
      avatarClass: "av-3",
      initials: "TP",
      photoUrl: null,
      status: "pending",
      rating: new Prisma.Decimal("4.9"),
      reviewCount: 12,
    },
  });

  for (const sample of availabilitySlots) {
    await seedSlot(sample, todayIso);
  }

  const sampleProIds = new Set(availabilitySlots.map((slot) => slot.professionalId));
  const extraPros = [
    ...professionals.filter((pro) => !sampleProIds.has(pro.id)).map((pro) => ({ id: pro.id, slug: pro.slug })),
    { id: "pro-test-provider", slug: "test-provider" },
  ];
  for (const pro of extraPros) {
    await seedOpenSlots(pro.id, pro.slug, todayIso);
  }

  await seedExtraBookings();

  const [users, pros, slots, bookings] = await Promise.all([
    prisma.user.count(),
    prisma.professional.count(),
    prisma.slot.count(),
    prisma.booking.count(),
  ]);
  console.log(`Seeded users=${users} professionals=${pros} slots=${slots} bookings=${bookings}`);
}

function extraSlotCount(slug: string) {
  const total = [...slug].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (total % 3) + 1;
}

/** 1–3 future open hours for providers who have no sample slots. Times are EAT wall clock. */
async function seedOpenSlots(professionalId: string, slug: string, todayIso: string) {
  const count = extraSlotCount(slug);
  for (let index = 0; index < count; index += 1) {
    const dateIso = addDays(todayIso, index + 1);
    const timeLabel = EXTRA_HOURS[index]!;
    const startsAt = startsAtFromEat(dateIso, timeLabel);
    await prisma.slot.create({
      data: {
        id: `slot-${slug}-${index + 1}`,
        professionalId,
        startsAt,
        endsAt: new Date(startsAt.getTime() + 60 * 60 * 1000),
        status: "open",
      },
    });
  }
}

const EXTRA_BOOKINGS = [
  {
    status: "upcoming" as const,
    clientId: "user-abel",
    guestFirstName: "Abel",
    guestLastName: "Desta",
    guestEmail: "abel@example.com",
    linkState: "ready" as const,
  },
  {
    status: "upcoming" as const,
    clientId: "user-test-client",
    guestFirstName: "Test",
    guestLastName: "Client",
    guestEmail: "test.client@example.com",
    linkState: "pending" as const,
  },
  {
    status: "upcoming" as const,
    guestFirstName: "Sara",
    guestLastName: "Bekele",
    guestEmail: "sara.bekele@example.com",
    linkState: "ready" as const,
  },
  {
    status: "upcoming" as const,
    guestFirstName: "Daniel",
    guestLastName: "Haile",
    guestEmail: "daniel.haile@example.com",
    linkState: "ready" as const,
  },
  {
    status: "cancelled" as const,
    guestFirstName: "Marta",
    guestLastName: "Kebede",
    guestEmail: "marta.kebede@example.com",
    cancelledBy: "guest" as const,
  },
  {
    status: "completed" as const,
    guestFirstName: "Helen",
    guestLastName: "Assefa",
    guestEmail: "helen.assefa@example.com",
    linkState: "ready" as const,
  },
];

/** A few extra bookings on open slots, one provider each, so the directory is not Hana-only. */
async function seedExtraBookings() {
  const openSlots = await prisma.slot.findMany({
    where: { status: "open" },
    orderBy: [{ professionalId: "asc" }, { startsAt: "asc" }],
    include: { professional: { select: { specialties: true } } },
  });
  const seen = new Set<string>();
  const chosen = openSlots.filter((slot) => {
    if (seen.has(slot.professionalId)) return false;
    seen.add(slot.professionalId);
    return true;
  });

  for (const [index, booking] of EXTRA_BOOKINGS.entries()) {
    const slot = chosen[index];
    if (!slot) break;
    const claimsSlot = booking.status === "upcoming" || booking.status === "completed";
    if (claimsSlot) {
      await prisma.slot.update({ where: { id: slot.id }, data: { status: "booked" } });
    }
    await prisma.booking.create({
      data: {
        id: `booking-extra-${index + 1}`,
        clientId: "clientId" in booking ? booking.clientId : undefined,
        professionalId: slot.professionalId,
        slotId: slot.id,
        specialty: slot.professional.specialties[0] ?? "individual-mental-health",
        feeCents: FEE_CENTS,
        currency: "usd",
        status: booking.status,
        sessionCode: `AYZ-X${index + 1}4K`,
        manageTokenHash: sha256(`seed-manage-extra-${index + 1}`),
        joinTokenHash: sha256(`seed-join-extra-${index + 1}`),
        linkState: "linkState" in booking ? booking.linkState : undefined,
        cancelledBy: "cancelledBy" in booking ? booking.cancelledBy : undefined,
        guestFirstName: booking.guestFirstName,
        guestLastName: booking.guestLastName,
        guestEmail: booking.guestEmail,
      },
    });
  }
}

async function seedSlot(sample: AvailabilitySlot, todayIso: string) {
  const dateIso = resolveSampleDate(sample.dayLabel, todayIso);
  const startsAt = startsAtFromEat(dateIso, sample.timeLabel);
  const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);
  const status = sample.status as SlotStatus;

  await prisma.slot.create({
    data: {
      id: sample.id,
      professionalId: sample.professionalId,
      startsAt,
      endsAt,
      status,
    },
  });

  if (status !== "booked") return;

  await prisma.booking.create({
    data: {
      id: `booking-${sample.id}`,
      clientId: "user-abel",
      professionalId: sample.professionalId,
      slotId: sample.id,
      specialty: "individual-mental-health",
      feeCents: FEE_CENTS,
      currency: "usd",
      status: "upcoming",
      sessionCode: `AYZ-${sample.id.replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase()}`,
      manageTokenHash: sha256(`seed-manage-${sample.id}`),
      joinTokenHash: sha256(`seed-join-${sample.id}`),
      linkState: "ready",
      guestEmail: "abel@example.com",
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
