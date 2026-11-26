import { Loader2 } from "lucide-react";

export function Loading({ text = "Carregando..." }) {
  return <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{text}</div>;
}
export function Empty({ text }) {
  return <div className="rounded-2xl border border-dashed py-12 text-center text-sm text-muted-foreground">{text}</div>;
}
export function ErrorState({ error }) {
  return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error?.message || "Erro ao carregar."}</div>;
}
export function PageTitle({ eyebrow, title, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><p className="eyebrow">{eyebrow}</p><h1 className="h-display text-3xl sm:text-4xl">{title}</h1></div>
      {children}
    </div>
  );
}