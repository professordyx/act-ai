import { Link } from "@tanstack/react-router";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useI18n } from "@/lib/i18n";
import { fieldHelp, helpCopy } from "@/lib/help-content";

export default function HelpTip({ helpKey }) {
  const { lang } = useI18n();
  const ui = helpCopy(lang);
  const entry = fieldHelp(helpKey);
  if (!entry) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${ui.fieldHelp}: ${entry.label[lang]}`}
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border text-[10px] font-bold leading-none text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          ?
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 text-sm">
        <p className="font-heading text-base font-semibold text-secondary">{entry.label[lang]}</p>
        <p className="mt-1 text-xs text-muted-foreground">{entry.hint[lang]}</p>
        <Link to="/manual" search={{ section: entry.section }} className="mt-2 inline-block text-xs font-semibold text-primary underline-offset-4 hover:underline">
          {ui.openManual}
        </Link>
      </PopoverContent>
    </Popover>
  );
}