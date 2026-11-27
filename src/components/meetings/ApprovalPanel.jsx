import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { approveMinutes, archiveMeeting, rejectMinutes } from "@/lib/minutes-fns";
import { useAct } from "@/hooks/use-act";
import { base44 } from "@/api/base44Client";
import { fmt } from "@/lib/labels";
import { useI18n } from "@/lib/i18n";
import FieldHelp from "@/components/help/FieldHelp";

export default function ApprovalPanel({ data }) {
  const { t, locale } = useI18n();
  const { meeting: m, minutes: mi, approvals, perms } = data;
  const [comment, setComment] = useState("");
  const approve = useAct(approveMinutes, t("toast.approved"), () => base44.analytics.track({ eventName: "minutes_approved", properties: { meeting_id: m.id, minutes_id: mi?.id ?? null } }));
  const reject = useAct(rejectMinutes, t("toast.rejected"));
  const archive = useAct(archiveMeeting, t("toast.archived"));
  const waiting = mi?.status === "aguardando_aprovacao";
  const args = { meetingId: m.id, minutesId: mi?.id, comment: comment || undefined };
  return (
    <section className="card-soft p-5">
      <h2 className="mb-3 font-heading text-lg font-semibold uppercase">{t("ap.title")}</h2>
      <dl className="space-y-1 text-sm">
        <div className="flex justify-between gap-2"><dt className="text-muted-foreground">{t("ap.humanReview")}</dt><dd className="text-right font-semibold">{mi?.reviewedByUserId ? `${mi.reviewedByUserId}` : t("common.pending")}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-muted-foreground">{t("ap.approver")}</dt><dd className="text-right font-semibold">{m.approverUserId}</dd></div>
      </dl>
      {waiting && perms.canApprove && (
        <div className="mt-4 space-y-2">
          <FieldHelp helpKey="minutes.comment" label={t("ap.comment")}>
            <Textarea rows={3} placeholder={t("ap.comment")} value={comment} onChange={(e) => setComment(e.target.value)} />
          </FieldHelp>
          <div className="flex gap-2">
            <Button size="sm" disabled={approve.isPending} onClick={() => approve.mutate(args)}>{t("ap.approve")}</Button>
            <Button size="sm" variant="outline" disabled={!comment.trim() || reject.isPending} onClick={() => reject.mutate(args)}>{t("ap.reject")}</Button>
          </div>
        </div>
      )}
      {waiting && !perms.canApprove && <p className="mt-3 text-xs text-muted-foreground">{t("ap.waiting")}</p>}
      {m.status === "aprovada" && perms.isAdmin && <Button size="sm" variant="outline" className="mt-3" onClick={() => archive.mutate({ meetingId: m.id })}>{t("ap.archive")}</Button>}
      {approvals.length > 0 && (
        <ul className="mt-4 space-y-3 border-t pt-3 text-xs">
          {approvals.map((a) => (
            <li key={a.id}>
              <div className="font-semibold">{a.decision === "aprovado" ? t("ap.approved") : t("ap.rejected")} · v{a.minutesVersion} · {a.approverName}</div>
              <div className="text-muted-foreground">{fmt(a.created_date, true, locale)}{a.comment && ` · ${a.comment}`}</div>
              {a.contentHash && <div className="break-all font-mono text-[10px] text-muted-foreground">SHA-256: {a.contentHash}</div>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}