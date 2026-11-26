import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { transcribeRecording } from "@/lib/meetings-fns";
import { useAct } from "@/hooks/use-act";
import { useI18n } from "@/lib/i18n";

export default function TranscriptCard({ data }) {
  const { t } = useI18n();
  const { meeting: m, transcript: t2, recordings, perms } = data;
  const [manual, setManual] = useState(false);
  const [text, setText] = useState("");
  const run = useAct(transcribeRecording, t("toast.transcribed"));
  const locked = ["em_revisao", "aguardando_aprovacao", "aprovada", "arquivada"].includes(m.status);
  const rec = recordings[0];
  const go = (mode) => run.mutate({ meetingId: m.id, recordingId: rec?.id, mode, text: mode === "manual" ? text : undefined }, { onSuccess: () => setManual(false) });
  return (
    <section className="card-soft p-5">
      <h2 className="mb-1 font-heading text-lg font-semibold uppercase">{t("tr.title")}</h2>
      <p className="mb-3 text-xs text-muted-foreground">{t("tr.subtitle")}</p>
      {perms.canEdit && !locked && (
        <div className="mb-3 flex flex-wrap gap-2">
          <Button size="sm" disabled={!rec || run.isPending} onClick={() => go("auto")}>{run.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}{t("tr.transcribe")}</Button>
          <Button size="sm" variant="outline" onClick={() => setManual((v) => !v)}>{t("tr.paste")}</Button>
          <Button size="sm" variant="ghost" disabled={!rec || run.isPending} onClick={() => go("mock")}>{t("tr.mock")}</Button>
        </div>
      )}
      {manual && (
        <div className="mb-3 space-y-2">
          <Textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder={t("tr.pastePlaceholder")} />
          <Button size="sm" disabled={!text.trim() || run.isPending} onClick={() => go("manual")}>{t("tr.save")}</Button>
        </div>
      )}
      {t2?.status === "concluida" ? (
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-700">{t2.content}</pre>
      ) : <p className="text-sm text-muted-foreground">{t2?.status === "falhou" ? t("tr.failed") : t("tr.none")}</p>}
      {t2 && <p className="mt-2 text-xs text-muted-foreground">{t("tr.source")}: {t2.source}</p>}
    </section>
  );
}