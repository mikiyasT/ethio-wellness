import { ButtonLink } from "./button";

export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-8 text-center">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-ink-2">{body}</p>
      {actionHref && actionLabel ? (
        <div className="mt-5">
          <ButtonLink href={actionHref}>{actionLabel}</ButtonLink>
        </div>
      ) : null}
    </div>
  );
}
