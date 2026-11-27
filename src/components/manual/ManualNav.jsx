import {
  Archive,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CreditCard,
  FilePlus2,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  Rocket,
  Settings,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const ICONS = { Archive, BadgeCheck, BookOpen, CalendarDays, CreditCard, FilePlus2, LayoutDashboard, LifeBuoy, ListChecks, Rocket, Settings, ShieldCheck, Workflow };

export default function ManualNav({ sections, activeId, onSelect }) {
  const { lang } = useI18n();
  return (
    <nav aria-label="Manual" className="space-y-1">
      {sections.map((s) => {
        const Icon = ICONS[s.icon] || BookOpen;
        const active = s.id === activeId;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
              active ? "bg-primary/10 font-semibold text-primary" : "text-secondary/80 hover:bg-secondary/5 hover:text-secondary",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{s.title[lang]}</span>
          </button>
        );
      })}
    </nav>
  );
}