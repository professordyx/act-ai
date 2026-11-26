import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/lib/meetings-fns";
import PendingList from "@/components/dashboard/PendingList";
import { ErrorState, Loading, PageTitle } from "@/components/shared/States";

export const Route = createFileRoute("/_authed/approvals")({
  ssr: false,
  head: () => ({ meta: [{ title: "Aprovações · Atas Auditáveis" }] }),
  component: function Page() {
    const { data, isLoading, error } = useQuery({ queryKey: ["dashboard"], queryFn: () => getDashboard() });
    return (
      <div>
        <PageTitle eyebrow="Fluxo" title="Fila de revisão e aprovação" />
        {isLoading ? <Loading /> : error ? <ErrorState error={error} /> : (
          <div className="grid gap-6 lg:grid-cols-2">
            <PendingList title="Aguardando minha revisão" items={data.pendingReviews} empty="Nenhuma revisão pendente." />
            <PendingList title="Aguardando minha aprovação" items={data.pendingApprovals} empty="Nenhuma aprovação pendente." />
          </div>
        )}
      </div>
    );
  },
});