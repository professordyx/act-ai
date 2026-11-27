import { useState } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { fieldHelp } from "@/lib/help-content";
import HelpTip from "@/components/help/HelpTip";

// Rótulo com botão de ajuda e dica curta que aparece ao focar o campo.
export default function FieldHelp({ helpKey, label, children, className = "" }) {
  const { lang } = useI18n();
  const entry = fieldHelp(helpKey);
  const [focused, setFocused] = useState(false);
  return (
    <div
      className={cn("space-y-1.5", className)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <div className="flex items-center gap-1.5">
        <Label>{label || entry?.label?.[lang]}</Label>
        {entry && <HelpTip helpKey={helpKey} />}
      </div>
      {children}
      {entry && focused && (
        <p aria-live="polite" className="rounded-md bg-primary/5 px-2 py-1 text-xs text-primary">
          {entry.hint[lang]}
        </p>
      )}
    </div>
  );
}