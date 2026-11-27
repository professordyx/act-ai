import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import HelpTip from "@/components/help/HelpTip";
import { useI18n } from "@/lib/i18n";

export default function GlobalSearch() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const submit = (e) => {
    e.preventDefault();
    navigate({ to: "/meetings", search: { q: q.trim() || undefined } });
  };
  return (
    <form onSubmit={submit} className="hidden min-w-0 max-w-xs flex-1 items-center gap-1.5 xl:flex">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search.placeholder")} aria-label={t("search.placeholder")} className="h-9 w-full rounded-full pl-9" />
      </div>
      <HelpTip helpKey="search.global" />
    </form>
  );
}