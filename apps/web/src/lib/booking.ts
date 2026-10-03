import { categoryById } from "@ethio-wellness/shared";
import {
  db,
  formatFee,
  type DbProfessional,
  type DbSlot,
} from "@/lib/db";

export function bookPath(proSlug: string, slotId: string) {
  const params = new URLSearchParams({ pro: proSlug, slot: slotId });
  return `/client/book?${params.toString()}`;
}

export function withNext(href: string, next: string) {
  const params = new URLSearchParams({ next });
  const join = href.includes("?") ? "&" : "?";
  return `${href}${join}${params.toString()}`;
}

export async function resolveBookingContext(
  proSlug?: string | null,
  slotId?: string | null,
): Promise<{
  professional: DbProfessional;
  slot: DbSlot | undefined;
  dateLabel: string;
  specialtyName: string;
  fee: string;
  feeAmount: number;
}> {
  const approved = await db.professionals.list({ status: "approved" });
  const professional =
    (proSlug ? await db.professionals.getBySlug(proSlug) : undefined) ?? approved[0];
  if (!professional) {
    throw new Error("No professionals available");
  }

  const slots = await db.slots.listForProfessional(professional.id);
  let slot = slotId ? slots.find((item) => item.id === slotId) : undefined;
  if (slot && slot.professionalId !== professional.id) {
    slot = undefined;
  }
  if (!slot) {
    slot =
      slots.find((item) => item.status === "open") ??
      slots.find((item) => item.status !== "closed");
  }

  const specialtyId = professional.specialties[0];
  const specialtyName = categoryById(specialtyId)?.name ?? "Session";
  const dateLabel = slot ? `${slot.dayLabel}, ${slot.timeLabel}` : "TBD";
  return {
    professional,
    slot,
    dateLabel,
    specialtyName,
    fee: formatFee(professional.fee),
    feeAmount: professional.fee,
  };
}

export async function createBookingFromPayment(input: {
  clientId: string;
  professionalId: string;
  slotId: string;
}): Promise<{ bookingId: string }> {
  const professional = await db.professionals.getById(input.professionalId);
  const slot = await db.slots.getById(input.slotId);
  if (!professional || !slot) throw new Error("Professional or slot missing");
  if (slot.professionalId !== professional.id) {
    throw new Error("Slot does not belong to this professional");
  }

  const specialty = professional.specialties[0] ?? "individual-mental-health";
  const booking = await db.bookings.create({
    clientId: input.clientId,
    professionalId: professional.id,
    slotId: slot.id,
    specialty,
    dateLabel: `${slot.dayLabel}, ${slot.timeLabel}`,
    fee: professional.fee,
  });
  return { bookingId: booking.id };
}
