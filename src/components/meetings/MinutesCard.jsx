import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { completeReview, submitForReview, generateMinutes, saveMinutesDraft } from "@/lib/minutes-fns";
import { useAct } from "@/hooks/use-act";
import { STATUS } from "@/lib/labels";

function Highlighted({ text }) {
  return <div className="whitespace-pre-wrap text-sm leading-relaxed">{text.split(/(A VALIDAR)/g).map((p, i) => (p === "A VALIDAR" ? <mark key={i} className="rounded bg-amber-200 px-1 font-semibold text-amber-900">{p}</mark> : p))}</div>;
}

export default function MinutesCard({ data }) {
  const { meeting: m, minutes: mi, transcript, perms } = data;
  const [text, setText] = useState(mi?.content || "");
  const [summary, setSummary] = useState("");
  const [manual, setManual] = useState(false);
  useEffect(() => setText(mi?.content || ""), [mi?.content, mi?.version]);
  const gen = useAct(generateMinutes, "Minuta gerada");
  const save = useAct(saveMinutesDraft, "Rascunho salvo");
  const submit = useAct(submitForReview, "Enviada para revisão");
  const review = useAct(completeReview, "Revisão concluída");
  const status = mi?.status;
  const locked = ["aguardando_aprovacao", "aprovada", "arquivada"].includes(m.status);
  const editable = perms.canEdit && !locked && (mi || manual);
  const approved = status === "aprovada";
  const dirty = mi && text !== mi.content;

  return (
    <section className={`rounded-2xl border bg-white p-5 shadow-[0_4px_12px_rgba(33,58,72,.06)] ${approved ? "border-emerald-500 border-2" : ""}`}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold uppercase">3. {approved ? "Ata aprovada" : "Minuta de ata"}{mi && ` · v${mi.version}`}</h2>
        {status && <span className="text-xs font-semibold text-muted-foreground">{STATUS[m.status]?.[0]} · {mi.generatedBy === "ia" ? "Gerada por IA" : mi.generatedBy === "humano" ? "Escrita por humano" : "IA com edição humana"}</span>}
      </div>
      {mi && !approved && (
        <div className="mb-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900"><Sparkles className="h-4 w-4 shrink-0" />Conteúdo gerado por IA: exige validação humana antes da aprovação. Trechos "A VALIDAR" precisam de conferência.</div>
      )}
      {perms.canEdit && !locked && (
        <div className="mb-3 flex flex-wrap gap-2">
          <Button size="sm" disabled={transcript?.status !== "concluida" || gen.isPending} onClick={() => gen.mutate({ meetingId: m.id })}>
            {gen.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}{mi ? "Gerar novamente com IA" : "Gerar minuta"}
          </Button>
          {!mi && <Button size="sm" variant="outline" onClick={() => setManual(true)}>Escrever manualmente</Button>}
        </div>
      )}
      {!mi && !manual && <p className="text-sm text-muted-foreground">Ainda não há minuta. Conclua a transcrição e gere a minuta.</p>}
      {editable ? (
        <div className="space-y-2">
          <Textarea rows={16} value={text} onChange={(e) => setText(e.target.value)} className="font-body" />
          {mi && <Highlighted text={text} />}
          <Input placeholder="Resumo da alteração (opcional)" value={summary} onChange={(e) => setSummary(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={!text.trim() || (mi && !dirty) || save.isPending} onClick={() => save.mutate({ meetingId: m.id, minutesId: mi?.id, content: text, changeSummary: summary || undefined }, { onSuccess: () => { setSummary(""); setManual(false); } })}>Salvar rascunho</Button>
            {perms.canSubmit && <Button size="sm" variant="secondary" disabled={dirty || submit.isPending} onClick={() => submit.mutate({ meetingId: m.id, minutesId: mi.id })}>Enviar para revisão</Button>}
            {mi?.status === "em_revisao" && perms.canReview && <Button size="sm" variant="secondary" disabled={dirty || review.isPending} onClick={() => review.mutate({ meetingId: m.id, minutesId: mi.id })}>Concluir revisão</Button>}
          </div>
          {dirty && <p className="text-xs text-muted-foreground">Salve o rascunho antes de enviar ou concluir a revisão.</p>}
        </div>
      ) : mi && <div className="rounded-xl bg-slate-50/60 p-4"><Highlighted text={mi.content} /></div>}
    </section>
  );
}