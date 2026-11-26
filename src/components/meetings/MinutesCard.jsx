import { useEffect, useState } from "react";
import { Download, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { completeReview, submitForReview, generateMinutes, saveMinutesDraft } from "@/lib/minutes-fns";
import TemplatePicker from "@/components/meetings/TemplatePicker";
import { useAct } from "@/hooks/use-act";
import { useI18n } from "@/lib/i18n";
import { downloadMinutesPdf } from "@/lib/minutes-pdf";

function Highlighted({ text }) {
  return <div className="whitespace-pre-wrap text-sm leading-relaxed">{text.split(/(A VALIDAR)/g).map((p, i) => (p === "A VALIDAR" ? <mark key={i} className="rounded bg-amber-200 px-1 font-semibold text-amber-900">{p}</mark> : p))}</div>;
}

export default function MinutesCard({ data }) {
  const { t, locale } = useI18n();
  const { meeting: m, minutes: mi, transcript, approvals = [], perms } = data;
  const [text, setText] = useState(mi?.content || "");
  const [summary, setSummary] = useState("");
  const [manual, setManual] = useState(false);
  const [template, setTemplate] = useState("system");
  useEffect(() => setText(mi?.content || ""), [mi?.content, mi?.version]);
  const gen = useAct(generateMinutes, t("toast.minutesGenerated"));
  const save = useAct(saveMinutesDraft, t("toast.draftSaved"));
  const submit = useAct(submitForReview, t("toast.sentToReview"));
  const review = useAct(completeReview, t("toast.reviewDone"));
  const status = mi?.status;
  const locked = ["aguardando_aprovacao", "aprovada", "arquivada"].includes(m.status);
  const editable = perms.canEdit && !locked && (mi || manual);
  const approved = status === "aprovada";
  const dirty = mi && text !== mi.content;
  const genData = () =>
    template === "system"
      ? { meetingId: m.id }
      : template.startsWith("ex:")
        ? { meetingId: m.id, templateKey: template.slice(3) }
        : { meetingId: m.id, templateId: template };

  return (
    <section className={`rounded-2xl border bg-white p-5 shadow-[0_4px_12px_rgba(33,58,72,.06)] ${approved ? "border-emerald-500 border-2" : ""}`}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold uppercase">3. {approved ? t("min.approved") : t("min.draft")}{mi && ` · v${mi.version}`}</h2>
        <div className="flex items-center gap-3">
          {status && <span className="text-xs font-semibold text-muted-foreground">{t(`status.${m.status}`)} · {mi.generatedBy === "ia" ? t("min.byAi") : mi.generatedBy === "humano" ? t("min.byHuman") : t("min.byHybrid")}{mi.templateName ? ` · ${t("tpl.used")}: ${mi.templateName}` : ""}</span>}
          {mi && (
            <Button size="sm" variant="outline" onClick={() => downloadMinutesPdf({ meeting: m, minutes: mi, approvals, t, locale })}>
              <Download className="mr-1 h-4 w-4" />{t("min.download")}
            </Button>
          )}
        </div>
      </div>
      {mi && !approved && (
        <div className="mb-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900"><Sparkles className="h-4 w-4 shrink-0" />{t("min.aiWarning")}</div>
      )}
      {perms.canEdit && !locked && (
        <div className="mb-3 space-y-2">
          <TemplatePicker value={template} onChange={setTemplate} />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={transcript?.status !== "concluida" || gen.isPending} onClick={() => gen.mutate(genData())}>
              {gen.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}{mi ? t("min.regenerate") : t("min.generate")}
            </Button>
            {!mi && <Button size="sm" variant="outline" onClick={() => setManual(true)}>{t("min.manual")}</Button>}
          </div>
        </div>
      )}
      {!mi && !manual && <p className="text-sm text-muted-foreground">{t("min.empty")}</p>}
      {editable ? (
        <div className="space-y-2">
          <Textarea rows={16} value={text} onChange={(e) => setText(e.target.value)} className="font-body" />
          {mi && <Highlighted text={text} />}
          <Input placeholder={t("min.changeSummary")} value={summary} onChange={(e) => setSummary(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={!text.trim() || (mi && !dirty) || save.isPending} onClick={() => save.mutate({ meetingId: m.id, minutesId: mi?.id, content: text, changeSummary: summary || undefined }, { onSuccess: () => { setSummary(""); setManual(false); } })}>{t("min.saveDraft")}</Button>
            {perms.canSubmit && <Button size="sm" variant="secondary" disabled={dirty || submit.isPending} onClick={() => submit.mutate({ meetingId: m.id, minutesId: mi.id })}>{t("min.submit")}</Button>}
            {mi?.status === "em_revisao" && perms.canReview && <Button size="sm" variant="secondary" disabled={dirty || review.isPending} onClick={() => review.mutate({ meetingId: m.id, minutesId: mi.id })}>{t("min.finishReview")}</Button>}
          </div>
          {dirty && <p className="text-xs text-muted-foreground">{t("min.saveFirst")}</p>}
        </div>
      ) : mi && <div className="rounded-xl bg-slate-50/60 p-4"><Highlighted text={mi.content} /></div>}
    </section>
  );
}