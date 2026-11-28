import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { escalateSupport } from "@/lib/support-fns";
import { useI18n } from "@/lib/i18n";

const CATEGORIES = ["duvida", "problema_tecnico", "cobranca", "acesso", "sugestao"];

export default function HandoffForm({ messages, conversationId, onCancel }) {
  const { t } = useI18n();
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("duvida");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    if (summary.trim().length < 5 || busy) return;
    setBusy(true);
    setError("");
    try {
      const transcript = messages.map((m) => `${m.role === "user" ? "Usuário" : "Assistente"}: ${m.content || ""}`).join("\n").slice(-6000);
      const result = await escalateSupport({
        data: {
          subject: (messages.find((m) => m.role === "user")?.content || summary).slice(0, 120),
          summary: summary.trim(),
          conversationSummary: transcript,
          category,
          urgency: "normal",
          conversationId: conversationId || "",
        },
      });
      setTicket(result);
    } catch (e) {
      setError(t("support.ticketError"));
    } finally {
      setBusy(false);
    }
  };

  if (ticket) {
    return (
      <div className="flex h-full flex-col justify-center gap-3 p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("support.ticketTitle")}</p>
        <p className="font-heading text-2xl font-bold text-secondary">{t("support.ticketProtocol", { protocol: ticket.protocol })}</p>
        <p className="text-sm text-muted-foreground">{t("support.ticketContact", { email: ticket.email })}</p>
        <p className="text-xs text-muted-foreground">{t("support.ticketNote")}</p>
        <Button className="mt-2 rounded-full font-bold" onClick={onCancel}>{t("support.back")}</Button>
      </div>
    );
  }

  return (
    <form className="flex h-full flex-col gap-3 overflow-y-auto p-4" onSubmit={submit}>
      <div>
        <p className="font-heading text-lg font-bold text-secondary">{t("support.handoffTitle")}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t("support.handoffHint")}</p>
      </div>
      <label className="text-xs font-semibold text-secondary" htmlFor="support-category">{t("support.handoffCategory")}</label>
      <select
        id="support-category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {CATEGORIES.map((value) => <option key={value} value={value}>{t(`support.cat.${value}`)}</option>)}
      </select>
      <label className="text-xs font-semibold text-secondary" htmlFor="support-summary">{t("support.handoffSummary")}</label>
      <Textarea
        id="support-summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder={t("support.handoffPlaceholder")}
        className="min-h-[120px]"
        maxLength={2000}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="mt-auto flex gap-2">
        <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={onCancel}>{t("support.cancel")}</Button>
        <Button type="submit" className="flex-1 rounded-full font-bold" disabled={busy || summary.trim().length < 5}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t("support.submit")}
        </Button>
      </div>
    </form>
  );
}