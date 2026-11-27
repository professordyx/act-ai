import { Link } from "@tanstack/react-router";
import { CircleHelp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useI18n } from "@/lib/i18n";
import { helpCopy } from "@/lib/help-content";
import { manualSection } from "@/lib/manual-content";

// Instruções da tela atual, tiradas da seção correspondente do manual.
export default function PageHelp({ section }) {
  const { lang } = useI18n();
  const ui = helpCopy(lang);
  const s = manualSection(section);
  if (!s) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 text-xs font-semibold text-secondary transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <CircleHelp className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{ui.pageHelp}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <p className="font-heading text-base font-semibold text-secondary">{s.title[lang]}</p>
        <p className="mt-1 text-xs text-muted-foreground">{s.intro[lang]}</p>
        <ol className="mt-2 space-y-1.5 text-xs">
          {s.steps[lang].slice(0, 3).map((step, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="font-semibold text-primary">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <Link to="/manual" search={{ section: s.id }} className="mt-3 inline-block text-xs font-semibold text-primary underline-offset-4 hover:underline">
          {ui.openManual}
        </Link>
      </PopoverContent>
    </Popover>
  );
}