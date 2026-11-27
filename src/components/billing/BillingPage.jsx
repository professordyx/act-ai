import { useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { confirmCheckout, getBilling } from "@/lib/billing-fns";
import { ErrorState, Loading, PageTitle } from "@/components/shared/States";
import PlanCards from "@/components/billing/PlanCards";
import SubscriptionCard from "@/components/billing/SubscriptionCard";
import SeatPanel from "@/components/billing/SeatPanel";
import BillingHistory from "@/components/billing/BillingHistory";
import { useBillingCopy } from "@/lib/billing-i18n";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";

export default function BillingPage({ checkout }) {
  const c = useBillingCopy();
  const { t } = useI18n();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({ queryKey: ["billing"], queryFn: () => getBilling() });
  const done = useRef(false);

  // Volta do checkout: a ativação só acontece depois da confirmação do provedor no servidor.
  useEffect(() => {
    if (done.current) return;
    const pending = checkout === "success" || (data && data.status === "pagamento_pendente" && (data.pendingSeats || 0) > 0);
    if (!pending) return;
    done.current = true;
    confirmCheckout()
      .then((res) => {
        if (!res?.ok) return;
        base44.analytics.track({ eventName: "subscription_activated", properties: { seats: res.seats ?? null } });
        toast.success(c.checkoutSuccess);
        qc.invalidateQueries({ queryKey: ["billing"] });
      })
      .catch(() => toast.error(t("common.operationFailed")))
      .finally(() => {
        if (checkout) navigate({ to: "/billing", search: {}, replace: true });
      });
  }, [checkout, data]);

  if (isLoading) return <Loading />;
  if (error) return <ErrorState error={error} />;
  return (
    <div className="space-y-6">
      <PageTitle eyebrow={c.eyebrow} title={c.title} help="assinatura">
        <Link to="/planos" className="text-sm font-semibold text-primary hover:underline">{c.publicLink}</Link>
      </PageTitle>
      <SubscriptionCard data={data} />
      <PlanCards pricePerSeatUsd={data.pricePerSeatUsd} current={data.isPaid ? "paid" : "free"} />
      {data.isAdmin ? <SeatPanel data={data} /> : <p className="card-soft p-4 text-sm text-muted-foreground">{c.adminOnly} {c.contactAdmin}</p>}
      {data.isAdmin && <BillingHistory events={data.events} />}
    </div>
  );
}