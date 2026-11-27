import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2, Info } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { helpCopy } from "@/lib/help-content";

export default function ManualSection({ section }) {
  const { lang } = useI18n();
  const ui = helpCopy(lang);
  const steps = section.steps[lang] || [];
  const notes = section.notes[lang] || [];
  return (
    <article className="card-soft p-5 sm:p-7">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
        <div>
          <p className="eyebrow">{ui.eyebrow}</p>
          <h2 className="h-display text-2xl sm:text-3xl">{section.title[lang]}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{section.intro[lang]}</p>
        </div>
        {section.route && (
          <Link to={section.route} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-secondary transition-colors hover:border-primary hover:text-primary">
            {ui.openScreen}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </header>

      <section className="mt-5">
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-secondary">{ui.steps}</h3>
        <ol className="mt-3 space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
              <p className="text-sm leading-relaxed text-secondary/90">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {section.fields.length > 0 && (
        <section className="mt-6">
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-secondary">{ui.fields}</h3>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            {section.fields.map((f, i) => (
              <div key={i} className="rounded-xl border border-border/70 bg-[var(--brand-surface)] p-3">
                <dt className="text-sm font-semibold text-secondary">{f.label[lang]}</dt>
                <dd className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{f.how[lang]}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {notes.length > 0 && (
        <section className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <h3 className="flex items-center gap-1.5 font-heading text-sm font-semibold uppercase tracking-wide text-primary">
            <Info className="h-4 w-4" />
            {ui.notes}
          </h3>
          <ul className="mt-2 space-y-1.5">
            {notes.map((n, i) => (
              <li key={i} className="flex gap-2 text-xs leading-relaxed text-secondary/90">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}