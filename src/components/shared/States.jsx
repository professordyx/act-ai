import { Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Loading({ text }) {
  const { t } = useI18n();
  return <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{text || t("common.loading")}</div>;
}
export function Empty({ text }) {
  return <div className="rounded-2xl border border-dashed py-12 text-center text-sm text-muted-foreground">{text}</div>;
}
export function ErrorState({ error }) {
  const { t, tServer } = useI18n();
  return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{tServer(error?.message) || t("common.error")}</div>;
}
export function PageTitle({ eyebrow, title, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><p className="eyebrow">{eyebrow}</p><h1 className="h-display text-3xl sm:text-4xl">{title}</h1></div>
      {children}
    </div>
  );
}