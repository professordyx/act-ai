import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { helpCopy } from "@/lib/help-content";
import { MANUAL, manualSection } from "@/lib/manual-content";
import ManualNav from "@/components/manual/ManualNav";
import ManualSection from "@/components/manual/ManualSection";
import ManualAssistant from "@/components/manual/ManualAssistant";

export default function ManualPage() {
  const { lang } = useI18n();
  const ui = helpCopy(lang);
  const search = useSearch({ from: "/_authed/manual" });
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const activeId = manualSection(search.section)?.id || MANUAL[0].id;
  const active = manualSection(activeId);

  const term = query.trim().toLowerCase();
  const sections = term
    ? MANUAL.filter((s) =>
        [s.title[lang], s.intro[lang], ...(s.steps[lang] || []), ...s.fields.flatMap((f) => [f.label[lang], f.how[lang]]), ...(s.notes[lang] || [])]
          .join(" ")
          .toLowerCase()
          .includes(term),
      )
    : MANUAL;

  const select = (id) => navigate({ to: "/manual", search: { section: id }, replace: true });

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">{ui.eyebrow}</p>
        <h1 className="h-display text-3xl sm:text-4xl">{ui.title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{ui.intro}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={ui.searchPlaceholder}
              aria-label={ui.searchLabel}
              className="pl-9"
            />
          </div>
          {sections.length === 0 ? (
            <p className="px-1 text-xs text-muted-foreground">{ui.noResults}</p>
          ) : (
            <ManualNav sections={sections} activeId={activeId} onSelect={select} />
          )}
        </aside>

        <div className="space-y-6">
          <ManualAssistant />
          <ManualSection section={active} />
        </div>
      </div>
    </div>
  );
}