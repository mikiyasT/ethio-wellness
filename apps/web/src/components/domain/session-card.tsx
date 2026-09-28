"use client";

import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";

export function SessionCard({
  initials,
  avatarClass,
  title,
  meta,
  time,
  actionHref,
  actionLabel,
  tone = "primary",
}: {
  initials: string;
  avatarClass: string;
  title: string;
  meta: string;
  time: string;
  actionHref?: string;
  actionLabel?: string;
  tone?: "primary" | "gold";
}) {
  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center",
        tone === "primary" && "border-l-4 border-l-primary",
        tone === "gold" && "border-l-4 border-l-gold",
      )}
    >
      <Avatar initials={initials} avatarClass={avatarClass} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">{title}</p>
        <p className="text-sm text-ink-2">{meta}</p>
        <p className="text-sm text-ink-3">{time}</p>
      </div>
      {actionHref && actionLabel ? (
        <ButtonLink href={actionHref} className="shrink-0">
          {actionLabel}
        </ButtonLink>
      ) : null}
    </article>
  );
}
