import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreditCard, Users } from "lucide-react";
import { setPaidSeat, startSeatCheckout } from "@/lib/billing-fns";
import { openCheckout } from "@/lib/checkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useBillingCopy } from "@/lib/billing-i18n";
import { useI18n } from "@/lib/i18n";
import FieldHelp from "@/components/help/FieldHelp";
import HelpTip from "@/components/help/HelpTip";

export default function SeatPanel({ data }) {
  const c = useBillingCopy();
  const { t, tServer } = useI18n();
  const qc = useQueryClient();
  const [seats, setSeats] = useState(String(Math.max(1, data.seats || 1)));
  const [busy, setBusy] = useState(false);
  const seat = useMutation({
    mutationFn: ({ email, hasSeat }) => setPaidSeat({ data: { email, hasSeat } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["billing"] }),
    onError: (e) => toast.error(tServer(e?.message) || t("common.operationFailed")),
  });
  const quantity = Math.max(1, Math.min(500, Number(seats) || 1));
  const buy = async () => {
    setBusy(true);
    try {
      await openCheckout(
        () => startSeatCheckout({ data: { seats: quantity } }),
        () => {
          if (typeof window !== "undefined" && window.gtag) {
            window.gtag("event", "conversion", {
              send_to: "AW-18599761113/Fw9VCMqE7cAdENmph6VF",
              value: quantity * Number(data.pricePerSeatUsd || 0),
              currency: "USD",
            });
          }
        }
      );
    } catch (err) {
      toast.error(tServer(err?.message) || t("common.operationFailed"));
    } finally {
      setBusy(false);
    }
  };
  const full = data.seatsUsed >= data.seats;
  return (
    <section className="card-soft space-y-5 p-5">
      {!data.active && (
        <div>
          <h2 className="font-heading text-lg font-semibold uppercase">{c.buyTitle}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{c.buyHint}</p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <FieldHelp helpKey="billing.seats" label={c.seatsLabel} className="w-32">
              <Input type="number" min={1} max={500} value={seats} onChange={(e) => setSeats(e.target.value)} />
            </FieldHelp>
            <Button className="rounded-full font-bold" disabled={busy} onClick={buy}>
              <CreditCard className="mr-2 h-4 w-4" />{busy ? c.buying : c.buy}
            </Button>
            <span className="text-sm text-muted-foreground">US$ {quantity * data.pricePerSeatUsd} / {c.monthlyTotal.toLowerCase()}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{c.example}</p>
        </div>
      )}
      <div>
        <h2 className="flex items-center gap-1.5 font-heading text-lg font-semibold uppercase">
          {c.assignTitle}
          <HelpTip helpKey="billing.seats" />
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{c.assignHint}</p>
        {!data.active && <p className="mt-2 text-sm text-muted-foreground">{c.noSubscription}</p>}
        {data.active && data.seats > 0 && full && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-900">{c.seatLimit}</p>}
        <ul className="mt-3 divide-y">
          {data.profiles.map((p) => (
            <li key={p.email} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="min-w-0"><span className="block truncate font-semibold">{p.name || p.email}</span><span className="block truncate text-xs text-muted-foreground">{p.email}</span></span>
              <Switch checked={p.hasPaidSeat} disabled={seat.isPending || (full && !p.hasPaidSeat)} onCheckedChange={(v) => seat.mutate({ email: p.email, hasSeat: v })} />
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" />{c.apiCostHint}</span>
        <span className="font-semibold">{c.apiCost}: US$ {Number(data.apiCostUsd || 0).toFixed(2)}</span>
      </div>
    </section>
  );
}