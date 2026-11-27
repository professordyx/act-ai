import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { transcribeRecording, updateMeetingLanguage } from "@/lib/meetings-fns";
import { useAct } from "@/hooks/use-act";
import { LANGS, useI18n } from "@/lib/i18n";

export default function TranscriptCard({ data }) {
  const { t } = useI18n();
  const { meeting: m, transcript: t2, recordings, perms } = data;
  const [manual, setManual] = useState(false);
  const [text, setText] = useState("");
  const run = useAct(transcribeRecording, t("toast.transcribed"));
  const setLang = useAct(updateMeetingLanguage, t("toast.languageUpdated"));
  const locked = ["em_revisao", "aguardando_aprovacao", "aprovada", "arquivada"].includes(m.status);
  const rec = recordings[0];
  const go = (mode) => run.mutate({ meetingId: m.id, recordingId: rec?.id, mode, text: mode === "manual" ? text : undefined }, { onSuccess: () => setManual(false) });
  return (
    <section className="card-soft p-5">
      <h2 className="mb-1 font-heading text-lg font-semibold uppercase">{t("tr.title")}</h2>
      <p className="mb-3 text-xs text-muted-foreground">{t("tr.subtitle")}</p>
      {perms.canEdit && !locked && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Button size="sm" disabled={!rec || run.isPending} onClick={() => go("auto")}>{run.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}{t("tr.transcribe")}</Button>
          <Button size="sm" variant="outline" onClick={() => setManual((v) => !v)}>{t("tr.paste")}</Button>
          <Button size="sm" variant="ghost" disabled={!rec || run.isPending} onClick={() => go("mock")}>{t("tr.mock")}</Button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">{t("tr.language")}</span>
            <Select value={m.language || "pt"} onValueChange={(v) => setLang.mutate({ meetingId: m.id, language: v })} disabled={setLang.isPending}>
              <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{LANGS.map((l) => <SelectItem key={l.code} value={l.code}>{t(`lang.${l.code}`)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
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
      {t2?.status === "falhou" && t2.errorMessage && <p className="mt-1 break-words text-xs text-muted-foreground">{t2.errorMessage}</p>}
      {t2 && <p className="mt-2 text-xs text-muted-foreground">{t("tr.source")}: {t2.source}{t2.provider ? ` · ${t2.provider}/${t2.model}` : ""} · {t(`lang.${m.language || "pt"}`)}</p>}
    </section>
  );
}