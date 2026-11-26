import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ClipboardCheck, FileAudio, ListChecks, Users } from "lucide-react";
import { getDashboard } from "@/lib/meetings-fns";
import { Loading, ErrorState, PageTitle } from "@/components/shared/States";
import PendingList from "@/components/dashboard/PendingList";

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({ queryKey: ["dashboard"], queryFn: () => getDashboard() });
  if (isLoading) return <Loading />;
  if (error) return <ErrorState error={error} />;
  const c = data.counts;
  const kpis = [
    { label: "Reuniões", value: c.total, icon: Users },
    { label: "Aguardando gravação", value: c.aguardando_upload, icon: FileAudio },
    { label: "Em revisão", value: c.em_revisao, icon: ClipboardCheck },
    { label: "Aguardando aprovação", value: c.aguardando_aprovacao, icon: ClipboardCheck, featured: true },
    { label: "Aprovadas", value: c.aprovada, icon: CheckCircle2 },
    { label: "Ações pendentes", value: c.acoes, icon: ListChecks },
  ];
  return (
    <div className="space-y-8">
      <PageTitle eyebrow="Painel" title="Atas de reunião auditáveis" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className={k.featured ? "card-featured p-5" : "card-soft p-5"}>
            <k.icon className={k.featured ? "h-5 w-5 text-emerald-300" : "h-5 w-5 text-primary"} />
            <div className="mt-3 font-heading text-4xl font-bold">{k.value}</div>
            <div className="text-sm opacity-80">{k.label}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 text-sm sm:grid-cols-3">
        <div className="card-soft p-4"><span className="text-muted-foreground">Atas aprovadas</span><div className="font-heading text-2xl font-bold">{data.metrics.approvedPct}%</div></div>
        <div className="card-soft p-4"><span className="text-muted-foreground">Rejeitadas (das decididas)</span><div className="font-heading text-2xl font-bold">{data.metrics.rejectedPct}%</div></div>
        <div className="card-soft p-4"><span className="text-muted-foreground">Tempo médio até aprovação</span><div className="font-heading text-2xl font-bold">{data.metrics.avgHours === null ? "—" : `${data.metrics.avgHours} h`}</div></div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <PendingList title="Para eu revisar" items={data.pendingReviews} empty="Nenhuma revisão pendente." />
        <PendingList title="Para eu aprovar" items={data.pendingApprovals} empty="Nenhuma aprovação pendente." />
        <PendingList title="Reuniões que organizo e exigem ação" items={data.pendingUploads} empty="Tudo em dia." />
        <PendingList title="Minhas ações" items={data.myActions.map((a) => ({ ...a, scheduledAt: a.dueDate }))} empty="Nenhuma ação aberta." />
      </div>
    </div>
  );
}