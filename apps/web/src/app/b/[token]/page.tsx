"use client";

import { categoryById } from "@ethio-wellness/shared";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { fetchManagedBooking, manageCancel, manageReschedule, type ManagedBooking } from "@/lib/bookings-api";
import { formatBookerLocal } from "@/lib/guest-booking";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ManageBookingPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [managed, setManaged] = useState<ManagedBooking | null | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    void fetchManagedBooking(token)
      .then((found) => setManaged(found))
      .catch(() => setManaged(null));
  }, [token]);

  async function onCancel() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await manageCancel(token);
      setManaged((current) => (current ? { ...current, booking: result.booking, openSlots: result.pending ? current.openSlots : [] } : current));
      setMessage(
        result.pending
          ? "Inside 24 hours your professional decides. The session stays booked until they accept."
          : "This session is cancelled. A confirmation email is on its way.",
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not cancel");
    } finally {
      setBusy(false);
    }
  }

  async function onMove(slotId: string) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await manageReschedule(token, slotId);
      const next = await fetchManagedBooking(token);
      setManaged(next);
      setMessage(
        result.pending
          ? "Inside 24 hours your professional decides. This time is not held until they accept."
          : `Moved to ${formatBookerLocal(result.booking.slotAt)}. A confirmation email is on its way.`,
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not reschedule");
    } finally {
      setBusy(false);
    }
  }

  if (managed === undefined) return <div className="p-8 text-ink-2">Loading…</div>;
  if (!managed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState title="Link not found" body="This manage link is not valid. Use the link from your confirmation email." />
      </div>
    );
  }

  const { booking, professional } = managed;
  const pending = booking.changeRequest;

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <p className="text-sm font-medium text-teal-accent">Manage booking</p>
      <h1 className="mt-2 text-3xl font-bold text-ink">{professional.name}</h1>
      <p className="mt-2 text-ink-2">No account needed. This page is only for the person who has the link.</p>

      <dl className="mt-8 space-y-2 rounded-2xl border border-border bg-surface p-6 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-3">When</dt>
          <dd className="font-medium text-ink">{formatBookerLocal(booking.slotAt)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-3">Session</dt>
          <dd>{categoryById(booking.specialty)?.name}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-3">Code</dt>
          <dd className="font-mono font-semibold">{booking.sessionCode}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-3">Status</dt>
          <dd className="capitalize">{booking.status}</dd>
        </div>
      </dl>

      {message ? (
        <div className="mt-4">
          <Alert tone="info">{message}</Alert>
        </div>
      ) : null}
      {error ? (
        <div className="mt-4">
          <Alert tone="error">{error}</Alert>
        </div>
      ) : null}
      {pending ? (
        <div className="mt-4">
          <Alert tone="warning">
            {pending === "cancel"
              ? "You asked to cancel. Your professional still has to decide."
              : "You asked to move this session. Your professional still has to decide."}
          </Alert>
        </div>
      ) : null}

      {booking.status === "upcoming" && !pending ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-ink-2">
            {managed.guestCanChange
              ? "More than 24 hours out, you can cancel or pick another open hour yourself."
              : "Inside 24 hours, your professional decides. You can ask, and the session stays as booked until they accept."}
          </p>
          <Button variant="danger" disabled={busy} onClick={() => void onCancel()}>
            {managed.guestCanChange ? "Cancel this session" : "Ask to cancel"}
          </Button>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-ink">Other open hours</p>
            {managed.openSlots.length === 0 ? (
              <p className="text-sm text-ink-3">No other open hours right now.</p>
            ) : (
              managed.openSlots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2">
                  <span className="text-sm">{formatBookerLocal(slot.startsAt)}</span>
                  <Button size="sm" variant="secondary" disabled={busy} onClick={() => void onMove(slot.id)}>
                    {managed.guestCanChange ? "Move here" : "Ask to move here"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      <div className="mt-8">
        <ButtonLink href={`/join?code=${encodeURIComponent(booking.sessionCode)}`} variant="secondary">
          Go to join
        </ButtonLink>
      </div>
    </div>
  );
}
