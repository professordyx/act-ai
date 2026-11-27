import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import MeetingForm from "@/components/meetings/MeetingForm";
import { Button } from "@/components/ui/button";
import { Loading, PageTitle } from "@/components/shared/States";
import { getBilling } from "@/lib/billing-fns";
import { useBillingCopy } from "@/lib/billing-i18n";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authed/meetings/new")({
  ssr: false,
  head: () => ({ meta: [{ title: "Nova reunião · Atas Auditáveis" }] }),
  component: function Page() {
    const { t } = useI18n();
    const c = useBillingCopy();
    const { data, isLoading } = useQuery({ queryKey: ["billing"], queryFn: () => getBilling() });
    const blocked = !!data && !data.isPaid && data.usedToday >= data.freeMeetingsPerDay;
    return (
      <div className="mx-auto max-w-3xl">
        <PageTitle eyebrow={t("mt.eyebrow")} title={t("mt.newTitle")} />
        {isLoading ? <Loading /> : blocked ? (
          <div className="card-soft space-y-3 p-6">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-xl font-bold uppercase">{c.usageToday}</h2>
            <p className="text-sm text-muted-foreground">{c.usageRule} · {data.usedToday}/{data.freeMeetingsPerDay}</p>
            <Button asChild className="rounded-full font-bold"><Link to="/billing">{c.buy}</Link></Button>
          </div>
        ) : <MeetingForm />}
      </div>
    );
  },
});