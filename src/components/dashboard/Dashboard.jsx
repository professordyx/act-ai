import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ClipboardCheck, FileAudio, ListChecks, Users } from "lucide-react";
import { getDashboard } from "@/lib/meetings-fns";
import { Loading, ErrorState, PageTitle } from "@/components/shared/States";
import PendingList from "@/components/dashboard/PendingList";
import { useI18n } from "@/lib/i18n";

export default function Dashboard() {
  const { t } = useI18n();
  const { data, isLoading, error } = useQuery({ queryKey: ["dashboard"], queryFn: () => getDashboard() });
  if (isLoading) return <Loading />;
  if (error) return <ErrorState error={error} />;
  const c = data.counts;
  const kpis = [
    { label: t("dash.kpi.total"), value: c.total, icon: Users },
    { label: t("dash.kpi.awaitingRecording"), value: c.aguardando_upload, icon: FileAudio },
    { label: t("dash.kpi.inReview"), value: c.em_revisao, icon: ClipboardCheck },
    { label: t("dash.kpi.awaitingApproval"), value: c.aguardando_aprovacao, icon: ClipboardCheck, featured: true },
    { label: t("dash.kpi.approved"), value: c.aprovada, icon: CheckCircle2 },
    { label: t("dash.kpi.pendingActions"), value: c.acoes, icon: ListChecks },
  ];
  return (
    <div className="space-y-8">
      <PageTitle eyebrow={t("dash.eyebrow")} title={t("dash.title")} help="painel" />
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
        <div className="card-soft p-4"><span className="text-muted-foreground">{t("dash.metrics.approved")}</span><div className="font-heading text-2xl font-bold">{data.metrics.approvedPct}%</div></div>
        <div className="card-soft p-4"><span className="text-muted-foreground">{t("dash.metrics.rejected")}</span><div className="font-heading text-2xl font-bold">{data.metrics.rejectedPct}%</div></div>
        <div className="card-soft p-4"><span className="text-muted-foreground">{t("dash.metrics.avgTime")}</span><div className="font-heading text-2xl font-bold">{data.metrics.avgHours === null ? "—" : `${data.metrics.avgHours} h`}</div></div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <PendingList title={t("dash.list.review")} items={data.pendingReviews} empty={t("dash.empty.review")} />
        <PendingList title={t("dash.list.approve")} items={data.pendingApprovals} empty={t("dash.empty.approve")} />
        <PendingList title={t("dash.list.upload")} items={data.pendingUploads} empty={t("dash.empty.upload")} />
        <PendingList title={t("dash.list.actions")} items={data.myActions.map((a) => ({ ...a, scheduledAt: a.dueDate }))} empty={t("dash.empty.actions")} />
      </div>
    </div>
  );
}