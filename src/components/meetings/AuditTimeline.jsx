import { fmt } from "@/lib/labels";

export default function AuditTimeline({ logs }) {
  return (
    <section className="card-soft p-5">
      <h2 className="mb-3 font-heading text-lg font-semibold uppercase">Trilha de auditoria</h2>
      {logs.length === 0 ? <p className="text-sm text-muted-foreground">Sem eventos.</p> : (
        <ol className="relative max-h-96 space-y-4 overflow-auto border-l pl-4">
          {logs.map((l) => (
            <li key={l.id} className="relative text-xs">
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
              <div className="font-semibold">{l.eventDescription || l.eventType}</div>
              <div className="text-muted-foreground">{l.performedByName} · {fmt(l.created_date)}{l.ipAddress && ` · IP ${l.ipAddress}`}</div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}