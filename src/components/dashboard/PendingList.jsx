import { Link } from "@tanstack/react-router";
import StatusBadge from "@/components/shared/StatusBadge";
import { fmt } from "@/lib/labels";
import { useI18n } from "@/lib/i18n";

export default function PendingList({ title, items, empty }) {
  const { locale } = useI18n();
  return (
    <section className="card-soft p-5">
      <h2 className="mb-3 font-heading text-lg font-semibold uppercase">{title}</h2>
      {items.length === 0 ? <p className="text-sm text-muted-foreground">{empty}</p> : (
        <ul className="divide-y">
          {items.map((i) => (
            <li key={i.id}>
              <Link to="/meetings/$id" params={{ id: i.meetingId || i.id }} className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-primary">
                <span className="min-w-0 truncate font-semibold">{i.title}</span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">{fmt(i.scheduledAt, false, locale)}{i.meetingId ? null : <StatusBadge status={i.status} />}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}