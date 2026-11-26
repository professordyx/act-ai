import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { approveMinutes, archiveMeeting, rejectMinutes } from "@/lib/minutes-fns";
import { useAct } from "@/hooks/use-act";
import { fmt } from "@/lib/labels";

export default function ApprovalPanel({ data }) {
  const { meeting: m, minutes: mi, approvals, perms } = data;
  const [comment, setComment] = useState("");
  const approve = useAct(approveMinutes, "Ata aprovada");
  const reject = useAct(rejectMinutes, "Ata rejeitada");
  const archive = useAct(archiveMeeting, "Reunião arquivada");
  const waiting = mi?.status === "aguardando_aprovacao";
  const args = { meetingId: m.id, minutesId: mi?.id, comment: comment || undefined };
  return (
    <section className="card-soft p-5">
      <h2 className="mb-3 font-heading text-lg font-semibold uppercase">Aprovação</h2>
      <dl className="space-y-1 text-sm">
        <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Revisão humana</dt><dd className="text-right font-semibold">{mi?.reviewedByUserId ? `${mi.reviewedByUserId}` : "Pendente"}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Aprovador</dt><dd className="text-right font-semibold">{m.approverUserId}</dd></div>
      </dl>
      {waiting && perms.canApprove && (
        <div className="mt-4 space-y-2">
          <Textarea rows={3} placeholder="Comentário (obrigatório para rejeitar)" value={comment} onChange={(e) => setComment(e.target.value)} />
          <div className="flex gap-2">
            <Button size="sm" disabled={approve.isPending} onClick={() => approve.mutate(args)}>Aprovar</Button>
            <Button size="sm" variant="outline" disabled={!comment.trim() || reject.isPending} onClick={() => reject.mutate(args)}>Rejeitar</Button>
          </div>
        </div>
      )}
      {waiting && !perms.canApprove && <p className="mt-3 text-xs text-muted-foreground">Aguardando decisão do aprovador designado.</p>}
      {m.status === "aprovada" && perms.isAdmin && <Button size="sm" variant="outline" className="mt-3" onClick={() => archive.mutate({ meetingId: m.id })}>Arquivar</Button>}
      {approvals.length > 0 && (
        <ul className="mt-4 space-y-3 border-t pt-3 text-xs">
          {approvals.map((a) => (
            <li key={a.id}>
              <div className="font-semibold">{a.decision === "aprovado" ? "Aprovada" : "Rejeitada"} · v{a.minutesVersion} · {a.approverName}</div>
              <div className="text-muted-foreground">{fmt(a.created_date)}{a.comment && ` · ${a.comment}`}</div>
              {a.contentHash && <div className="break-all font-mono text-[10px] text-muted-foreground">SHA-256: {a.contentHash}</div>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}