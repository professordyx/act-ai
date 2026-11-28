import { useEffect, useState } from "react";
import { LifeBuoy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import SupportChat from "./SupportChat";

export default function SupportWidget() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("support.open")}
        title={t("support.open")}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_28px_rgba(33,58,72,.28)] transition hover:scale-105 hover:bg-primary/90"
      >
        <LifeBuoy className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-x-2 bottom-2 top-16 z-50 flex flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_24px_60px_rgba(33,58,72,.24)] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:top-auto sm:h-[600px] sm:max-h-[calc(100vh-2.5rem)] sm:w-[400px]">
      <div className="flex items-center gap-2.5 bg-secondary px-4 py-3 text-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
          <LifeBuoy className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-base font-bold leading-tight">{t("support.title")}</p>
          <p className="truncate text-xs text-white/70">{t("support.subtitle")}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10 hover:text-white" onClick={() => setOpen(false)} aria-label={t("support.close")}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <SupportChat />
    </div>
  );
}