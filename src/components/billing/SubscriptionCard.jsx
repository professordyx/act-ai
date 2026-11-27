import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cancelPlan } from "@/lib/billing-fns";
import { fmt } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { useBillingCopy } from "@/lib/billing-i18n";
import { useI18n } from "@/lib/i18n";

const TONE = {
  ativa: "bg-emerald-50 text-emerald-800 border-emerald-200",
  gratuito: "bg-slate-50 text-slate-700 border-slate-200",
  pagamento_pendente: "bg-amber-50 text-amber-900 border-amber-200",
  inadimplente: "bg-rose-50 text-rose-800 border-rose-200",
  cancelada: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function SubscriptionCard({ data }) {
  const c = useBillingCopy();
  const { locale, t, tServer } = useI18n();
  const qc = useQueryClient();
  const cancel = useMutation({
    mutationFn: () => cancelPlan(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["billing"] }),
    onError: (e) => toast.error(tServer(e?.message) || t("common.operationFailed")),
  });
  const label = { gratuito: c.statusGratuito, ativa: c.statusAtiva, pagamento_pendente: c.statusPendente, inadimplente: c.statusInadimplente, cancelada: c.statusCancelada }[data.status] || data.status;
  return (
    <section className="card-soft p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">{c.status}</p>
          <h2 className="font-heading text-xl font-bold uppercase">{label}</h2>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${TONE[data.status] || TONE.gratuito}`}>{data.isPaid ? c.paidName : c.freeName}</span>
      </div>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{c.seatsPurchased}</div><div className="font-heading text-2xl font-bold">{data.seats}</div></div>
        <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{c.seatsUsed}</div><div className="font-heading text-2xl font-bold">{data.seatsUsed}</div></div>
        <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{c.monthlyTotal}</div><div className="font-heading text-2xl font-bold">US$ {data.monthlyTotalUsd}</div></div>
      </div>
      {data.active && data.currentPeriodEnd && <p className="mt-3 text-sm text-muted-foreground">{c.paidUntil}: {fmt(data.currentPeriodEnd, true, locale)}</p>}
      {data.cancelAtPeriodEnd && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-900">{c.cancelScheduled}</p>}
      {!data.isPaid && <p className="mt-3 text-sm text-muted-foreground">{c.usageToday}: {data.usedToday}/{data.freeMeetingsPerDay} · {c.usageRule}</p>}
      {!data.hasSeat && data.active && <p className="mt-1 text-sm text-muted-foreground">{c.noSeat}</p>}
      {data.isAdmin && data.active && !data.cancelAtPeriodEnd && (
        <div className="mt-4 border-t pt-3">
          <p className="text-xs text-muted-foreground">{c.cancelHint}</p>
          <Button variant="outline" size="sm" className="mt-2" disabled={cancel.isPending} onClick={() => cancel.mutate()}>{c.cancel}</Button>
        </div>
      )}
    </section>
  );
}