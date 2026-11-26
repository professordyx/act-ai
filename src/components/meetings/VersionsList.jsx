import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fmt } from "@/lib/labels";
import { useI18n } from "@/lib/i18n";

export default function VersionsList({ versions }) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(null);
  return (
    <section className="card-soft p-5">
      <h2 className="mb-3 font-heading text-lg font-semibold uppercase">{t("ver.title")}</h2>
      {versions.length === 0 ? <p className="text-sm text-muted-foreground">{t("ver.empty")}</p> : (
        <ul className="divide-y text-sm">
          {versions.map((v) => (
            <li key={v.id}>
              <button className="flex w-full items-center justify-between gap-3 py-2 text-left hover:text-primary" onClick={() => setOpen(v)}>
                <span><b>v{v.version}</b> · {v.changeSummary || "—"}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{v.createdByUserId} · {fmt(v.created_date, true, locale)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[85vh] overflow-auto">
          <DialogHeader><DialogTitle>{t("ver.version")} {open?.version}</DialogTitle></DialogHeader>
          <div className="whitespace-pre-wrap text-sm">{open?.content}</div>
        </DialogContent>
      </Dialog>
    </section>
  );
}