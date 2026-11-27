import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askManual } from "@/lib/manual-fns";
import { useI18n } from "@/lib/i18n";
import { helpCopy } from "@/lib/help-content";
import FieldHelp from "@/components/help/FieldHelp";

const SUGGESTIONS = {
  pt: ["Como gravo e transcrevo uma reunião?", "Quem pode aprovar uma ata?", "Como funcionam os assentos?"],
  en: ["How do I record and transcribe a meeting?", "Who can approve a minute?", "How do seats work?"],
  es: ["¿Cómo grabo y transcribo una reunión?", "¿Quién puede aprobar un acta?", "¿Cómo funcionan los asientos?"],
};

export default function ManualAssistant() {
  const { lang } = useI18n();
  const ui = helpCopy(lang);
  const ask = useServerFn(askManual);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async (text) => {
    const question = (text ?? input).trim();
    if (question.length < 3 || busy) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setBusy(true);
    try {
      const res = await ask({ data: { question, lang } });
      setMessages((m) => [...m, { role: "assistant", text: res.answer }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: ui.assistantError, error: true }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card-soft overflow-hidden">
      <header className="flex flex-wrap items-start justify-between gap-2 border-b bg-[var(--brand-surface)] px-4 py-3">
        <div>
          <h2 className="flex items-center gap-1.5 font-heading text-base font-semibold uppercase text-secondary">
            <Sparkles className="h-4 w-4 text-primary" />
            {ui.assistantTitle}
          </h2>
          <p className="text-xs text-muted-foreground">{ui.assistantHint}</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setMessages([])} className="text-xs">
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            {ui.clear}
          </Button>
        )}
      </header>

      <div className="max-h-72 space-y-2 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{ui.assistantEmpty}</p>
            <div className="flex flex-wrap gap-1.5">
              {(SUGGESTIONS[lang] || SUGGESTIONS.pt).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-border px-2.5 py-1 text-left text-xs text-secondary transition-colors hover:border-primary hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <p
                className={
                  m.role === "user"
                    ? "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                    : `max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-bl-sm border px-3 py-2 text-sm ${m.error ? "border-rose-200 bg-rose-50 text-rose-800" : "bg-white text-secondary"}`
                }
              >
                {m.text}
              </p>
            </div>
          ))
        )}
        {busy && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            {ui.thinking}
          </p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="border-t px-4 py-3"
      >
        <FieldHelp helpKey="manual.question" label={ui.ask} className="sm:flex sm:items-center sm:gap-2 sm:space-y-0">
          <div className="flex flex-1 items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={ui.assistantPlaceholder}
              maxLength={600}
              aria-label={ui.assistantPlaceholder}
            />
            <Button type="submit" disabled={busy || input.trim().length < 3} className="shrink-0 rounded-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="ml-1 hidden sm:inline">{ui.ask}</span>
            </Button>
          </div>
        </FieldHelp>
      </form>
    </section>
  );
}