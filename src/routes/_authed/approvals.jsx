import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/lib/meetings-fns";
import PendingList from "@/components/dashboard/PendingList";
import { ErrorState, Loading, PageTitle } from "@/components/shared/States";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authed/approvals")({
  ssr: false,
  head: () => ({ meta: [{ title: "Aprovações · Atas Auditáveis" }] }),
  component: function Page() {
    const { t } = useI18n();
    const { data, isLoading, error } = useQuery({ queryKey: ["dashboard"], queryFn: () => getDashboard() });
    return (
      <div>
        <PageTitle eyebrow={t("appr.eyebrow")} title={t("appr.title")} help="aprovacoes" />
        {isLoading ? <Loading /> : error ? <ErrorState error={error} /> : (
          <div className="grid gap-6 lg:grid-cols-2">
            <PendingList title={t("appr.review")} items={data.pendingReviews} empty={t("dash.empty.review")} />
            <PendingList title={t("appr.approval")} items={data.pendingApprovals} empty={t("dash.empty.approve")} />
          </div>
        )}
      </div>
    );
  },
});