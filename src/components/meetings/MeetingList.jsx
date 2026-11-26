import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listMeetings } from "@/lib/meetings-fns";
import { STATUS_KEYS, fmt } from "@/lib/labels";
import StatusBadge from "@/components/shared/StatusBadge";
import { Empty, ErrorState, Loading } from "@/components/shared/States";
import { useI18n } from "@/lib/i18n";

export default function MeetingList({ fixedStatuses }) {
  const { t, locale } = useI18n();
  const [f, setF] = useState({ status: "all", text: "", from: "", to: "", organizer: "", participant: "" });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const statuses = fixedStatuses || (f.status === "all" ? undefined : [f.status]);
  const { data, isLoading, error } = useQuery({
    queryKey: ["meetings", statuses, f.text, f.from, f.to, f.organizer, f.participant],
    queryFn: () => listMeetings({ data: { statuses, text: f.text || undefined, from: f.from || undefined, to: f.to || undefined, organizer: f.organizer || undefined, participant: f.participant || undefined } }),
  });
  return (
    <div className="space-y-4">
      <div className="card-soft grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
        <Input placeholder={t("list.search")} value={f.text} onChange={set("text")} className="lg:col-span-2" />
        {!fixedStatuses && (
          <Select value={f.status} onValueChange={(v) => setF((p) => ({ ...p, status: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allStatuses")}</SelectItem>
              {STATUS_KEYS.map((k) => <SelectItem key={k} value={k}>{t(`status.${k}`)}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Input type="date" value={f.from} onChange={set("from")} title={t("list.from")} />
        <Input type="date" value={f.to} onChange={set("to")} title={t("list.to")} />
        <Input placeholder={t("list.organizer")} value={f.organizer} onChange={set("organizer")} />
        <Input placeholder={t("list.participant")} value={f.participant} onChange={set("participant")} />
      </div>
      {isLoading ? <Loading /> : error ? <ErrorState error={error} /> : data.length === 0 ? <Empty text={t("list.empty")} /> : (
        <div className="grid gap-3">
          {data.map((m) => (
            <Link key={m.id} to="/meetings/$id" params={{ id: m.id }} className="card-soft flex flex-col gap-2 p-4 transition-shadow hover:shadow-lg sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="truncate font-semibold">{m.title}</div>
                <div className="text-xs text-muted-foreground">{fmt(m.scheduledAt, true, locale)} · {t("list.organizerLabel")}: {m.organizerUserId}</div>
              </div>
              <StatusBadge status={m.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}