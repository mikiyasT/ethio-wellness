"use client";

import { categoryById, routes } from "@ethio-wellness/shared";
import { SessionCard } from "@/components/domain/session-card";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { DailyRoom } from "@/components/video/daily-room";
import { db, type DbBooking, type DbUser } from "@/lib/db";
import { fetchProfessionalBookings, startProfessionalVideo } from "@/lib/bookings-api";
import { formatOpensIn, getJoinWindow } from "@/lib/guest-booking";
import { fetchMyAvailability } from "@/lib/pro-api";
import { loadProDraftForUser } from "@/lib/pro-draft";
import { usePublicApi } from "@/lib/public-api";
import { AUTO_APPROVE_PROFESSIONALS, isAwaitingApproval } from "@/lib/pro-approval";
import { formatProviderEat, guestDisplayName, guestFirstName } from "@/lib/guest-booking";
import { useLocale } from "@/lib/locale";
import { useSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

function bookingPersonName(booking: DbBooking, clientsById: Record<string, DbUser>) {
  if (booking.guestFirstName || booking.guestEmail) {
    return guestDisplayName(booking.guestFirstName ?? "Guest", booking.guestLastName);
  }
  if (booking.clientId && clientsById[booking.clientId]) {
    return clientsById[booking.clientId]!.name;
  }
  return "Client";
}

export default function ProfessionalHomePage() {
  const { t } = useLocale();
  const router = useRouter();
  const { user, ready } = useSession();
  const [checklist, setChecklist] = useState({ about: false, specs: false, avail: false });
  const [needsSecondBio, setNeedsSecondBio] = useState(false);
  const [upcoming, setUpcoming] = useState<DbBooking[]>([]);
  const [clientsById, setClientsById] = useState<Record<string, DbUser>>({});
  const [hello, setHello] = useState("Good afternoon");
  const [now, setNow] = useState(() => new Date());
  const [joining, setJoining] = useState(false);
  const [videoNote, setVideoNote] = useState("");
  const [video, setVideo] = useState<{ id: string; token: string; roomUrl: string } | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (
      !AUTO_APPROVE_PROFESSIONALS &&
      user.role === "professional" &&
      isAwaitingApproval(user.professionalStatus)
    ) {
      router.replace(routes.professionalPending);
    }
  }, [ready, user, router]);

  useEffect(() => {
    if (!ready || !user.userId) return;
    void (async () => {
      if (usePublicApi()) {
        const draft = await loadProDraftForUser(user.userId!, user.name ?? "");
        const slots = user.professionalId ? await fetchMyAvailability() : [];
        setChecklist({
          about: Boolean(draft.name && draft.title && draft.bio),
          specs: draft.specialties.length > 0,
          avail: slots.some((slot) => slot.status === "open"),
        });
        setNeedsSecondBio(Boolean(draft.bio.trim()) && !draft.aboutTranslated.trim());
        const bookings = user.professionalId ? await fetchProfessionalBookings() : [];
        setUpcoming(bookings.filter((booking) => booking.status === "upcoming"));
        setHello(`Good afternoon, ${draft.name || user.name || "there"} 👋`);
        return;
      }
      const pro =
        (user.professionalId ? await db.professionals.getById(user.professionalId) : undefined) ??
        (await db.professionals.getByUserId(user.userId!));
      if (!pro) return;

      const draft = await loadProDraftForUser(user.userId!, user.name ?? "");
      const slots = await db.slots.listForProfessional(pro.id);
      setChecklist({
        about: Boolean(draft.name && draft.title && draft.bio),
        specs: draft.specialties.length > 0,
        avail: slots.some((slot) => slot.status === "open"),
      });
      setNeedsSecondBio(Boolean(draft.bio.trim()) && !draft.aboutTranslated.trim());

      const list = (await db.bookings.listForProfessional(pro.id)).filter(
        (booking) => booking.status === "upcoming",
      );
      setUpcoming(list);
      const map: Record<string, DbUser> = {};
      for (const booking of list) {
        if (booking.clientId && !map[booking.clientId]) {
          const client = await db.users.getById(booking.clientId);
          if (client) map[booking.clientId] = client;
        }
      }
      setClientsById(map);
      setHello(`Good afternoon, ${pro.name} 👋`);
    })();
  }, [ready, user.userId, user.professionalId, user.name]);

  const live = upcoming
    .filter((booking) => {
      const end = booking.endsAt
        ? new Date(booking.endsAt).getTime()
        : new Date(booking.slotAt).getTime() + 60 * 60_000;
      return end > now.getTime();
    })
    .sort((a, b) => new Date(a.slotAt).getTime() - new Date(b.slotAt).getTime());
  const next = live[0];
  const nextName = next ? bookingPersonName(next, clientsById) : undefined;
  const nextWindow = next ? getJoinWindow(next.slotAt, now, next.endsAt) : null;

  async function onJoin(bookingId: string) {
    setVideoNote("");
    setJoining(true);
    try {
      const room = await startProfessionalVideo(bookingId);
      setVideo({ id: bookingId, token: room.token, roomUrl: room.roomUrl });
    } catch (caught) {
      setVideoNote(caught instanceof Error ? caught.message : "Video isn’t available right now.");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div>
      <h1 className="text-[32px] font-bold text-ink md:text-[40px]">{hello}</h1>
      <p className="mt-2 text-ink-2">{t("proHome.dateLine")}</p>

      {needsSecondBio ? (
        <div className="mt-6">
          <Alert tone="warning">
            Complete your profile — add your second-language bio so guests can read it in your language.{" "}
            <a href={routes.professionalProfile} className="font-medium underline">
              Add it on your profile
            </a>
          </Alert>
        </div>
      ) : null}
      <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-semibold text-ink">{t("proHome.checklistTitle")}</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li className={checklist.about ? "text-teal-accent" : "text-ink-2"}>
            {checklist.about ? "✓" : "○"} {t("proHome.checklistAbout")}
          </li>
          <li className={checklist.specs ? "text-teal-accent" : "text-ink-2"}>
            {checklist.specs ? "✓" : "○"} {t("proHome.checklistSpecs")}
          </li>
          <li className={checklist.avail ? "text-teal-accent" : "text-ink-2"}>
            {checklist.avail ? "✓" : "○"} {t("proHome.checklistAvail")}
          </li>
        </ul>
        <div className="mt-4">
          <ButtonLink href={routes.professionalProfile} size="sm">
            {t("proHome.complete")}
          </ButtonLink>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [String(upcoming.length), t("proHome.upcoming")],
          [checklist.avail ? "Open" : "—", t("proHome.availability")],
        ].map(([value, label]) => (
          <div key={label} className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-2xl font-bold text-ink">{value}</p>
            <p className="mt-1 text-sm text-ink-2">{label}</p>
          </div>
        ))}
      </div>

      {next && nextName ? (
        <section className="mt-8">
          <h2 className="mb-3 text-xl font-semibold">{t("proHome.nextSession")}</h2>
          <div className="space-y-3">
            <SessionCard
              initials={initialsOf(nextName)}
              avatarClass="av-1"
              title={`${nextName} · ${categoryById(next.specialty)?.name}`}
              meta={next.dateLabel}
              time="Video call"
              tone="gold"
            />
            {video?.id === next.id ? (
              <DailyRoom roomUrl={video.roomUrl} token={video.token} />
            ) : (
              <Button disabled={!nextWindow?.canJoin || joining} block onClick={() => void onJoin(next.id)}>
                {t("sessions.join")}
              </Button>
            )}
            <p className="text-sm text-ink-3">
              {nextWindow?.phase === "soon"
                ? `Join opens in ${formatOpensIn(nextWindow.opensInMs)}.`
                : "Join is open. Check your camera, then admit the guest from the waiting room."}
            </p>
            {videoNote ? <Alert tone="error">{videoNote}</Alert> : null}
          </div>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="text-xl font-semibold">{t("proHome.schedule")}</h2>
        <div className="mt-3 space-y-3">
          {upcoming.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p>{t("proHome.emptySchedule")}</p>
              <div className="mt-3">
                <ButtonLink href={routes.professionalAvailability}>{t("proHome.availability")}</ButtonLink>
              </div>
            </div>
          ) : (
            upcoming.map((booking) => {
              const name = bookingPersonName(booking, clientsById);
              const isGuest = Boolean(booking.guestEmail) && !booking.clientId;
              return (
                <article
                  key={booking.id}
                  className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
                >
                  <div>
                    <p className="font-semibold">
                      {name}
                      {isGuest ? (
                        <span className="ml-2 rounded-full border border-border bg-surface-warm px-2 py-0.5 text-xs font-medium text-ink-2">
                          Guest
                        </span>
                      ) : null}
                    </p>
                    <p className="text-sm text-ink-2">{formatProviderEat(booking.slotAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-sm text-ink-3">{guestFirstName(booking)}</p>
                    {getJoinWindow(booking.slotAt, now, booking.endsAt).canJoin ? (
                      <Button size="sm" onClick={() => void onJoin(booking.id)}>
                        {t("sessions.join")}
                      </Button>
                    ) : null}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={routes.professionalAvailability}>{t("proHome.availability")}</ButtonLink>
        <ButtonLink href={routes.professionalBookings} variant="secondary">
          {t("proHome.bookings")}
        </ButtonLink>
        <ButtonLink href={routes.professionalProfile} variant="text">
          {t("proHome.edit")}
        </ButtonLink>
      </div>
    </div>
  );
}
