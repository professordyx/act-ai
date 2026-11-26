import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getMeetingDetails } from "@/lib/meetings-fns";
import { fmt } from "@/lib/labels";
import StatusBadge from "@/components/shared/StatusBadge";
import { ErrorState, Loading } from "@/components/shared/States";
import RecordingCard from "@/components/meetings/RecordingCard";
import TranscriptCard from "@/components/meetings/TranscriptCard";
import MinutesCard from "@/components/meetings/MinutesCard";
import ApprovalPanel from "@/components/meetings/ApprovalPanel";
import ParticipantsCard from "@/components/meetings/ParticipantsCard";
import ActionsCard from "@/components/meetings/ActionsCard";
import VersionsList from "@/components/meetings/VersionsList";
import AuditTimeline from "@/components/meetings/AuditTimeline";
import { useI18n } from "@/lib/i18n";

export default function MeetingDetail({ id }) {
  const { t, locale } = useI18n();
  const { data, isLoading, error } = useQuery({ queryKey: ["meeting", id], queryFn: () => getMeetingDetails({ data: { id } }) });
  if (isLoading) return <Loading />;
  if (error) return <ErrorState error={error} />;
  const m = data.meeting;
  return (
    <div className="space-y-6">
      <Link to="/meetings" className="inline-flex items-center gap-1 text-sm font-semibold text-primary"><ArrowLeft className="h-4 w-4" />{t("detail.back")}</Link>
      <div className="card-featured p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">{t(`location.${m.locationType}`)} · {fmt(m.scheduledAt, true, locale)}</p>
            <h1 className="mt-1 font-heading text-3xl font-bold uppercase sm:text-4xl">{m.title}</h1>
            {m.description && <p className="mt-2 max-w-2xl text-sm text-slate-300">{m.description}</p>}
          </div>
          <StatusBadge status={m.status} />
        </div>
        <div className="mt-4 grid gap-1 text-sm text-slate-300 sm:grid-cols-3">
          <span>{t("detail.organizer")}: {m.organizerUserId}</span><span>{t("detail.reviewer")}: {m.reviewerUserId}</span><span>{t("detail.approver")}: {m.approverUserId}</span>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {data.perms.full && <RecordingCard data={data} />}
          {data.perms.full && <TranscriptCard data={data} />}
          <MinutesCard data={data} />
          {data.perms.full && <VersionsList versions={data.versions} />}
        </div>
        <div className="space-y-6">
          <ApprovalPanel data={data} />
          <ParticipantsCard participants={data.participants} />
          <ActionsCard data={data} />
          {data.perms.full && <AuditTimeline logs={data.audit} />}
        </div>
      </div>
    </div>
  );
}