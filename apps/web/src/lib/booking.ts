import {
  availabilitySlots,
  categoryById,
  professionalBySlug,
  professionals,
  type AvailabilitySlot,
  type Professional,
} from "@ethio-wellness/shared";

export const SESSION_FEE = "$25";

export function slotById(id: string) {
  return availabilitySlots.find((slot) => slot.id === id);
}

export function resolveBookingContext(proSlug?: string | null, slotId?: string | null): {
  professional: Professional;
  slot: AvailabilitySlot | undefined;
  dateLabel: string;
  specialtyName: string;
  fee: string;
} {
  const professional =
    (proSlug ? professionalBySlug(proSlug) : undefined) ?? professionals[0];
  const slot =
    (slotId ? slotById(slotId) : undefined) ??
    availabilitySlots.find((item) => item.professionalId === professional.id && item.status === "open") ??
    availabilitySlots.find((item) => item.professionalId === professional.id);
  const specialtyId = professional.specialties[0];
  const specialtyName = categoryById(specialtyId)?.name ?? "Session";
  const dateLabel = slot ? `${slot.dayLabel}, ${slot.timeLabel}` : "TBD";
  return { professional, slot, dateLabel, specialtyName, fee: SESSION_FEE };
}

export function bookPath(proSlug: string, slotId: string) {
  const params = new URLSearchParams({ pro: proSlug, slot: slotId });
  return `/client/book?${params.toString()}`;
}

export function withNext(href: string, next: string) {
  const params = new URLSearchParams({ next });
  const join = href.includes("?") ? "&" : "?";
  return `${href}${join}${params.toString()}`;
}
