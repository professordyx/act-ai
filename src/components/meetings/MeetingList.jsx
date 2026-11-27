import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FieldHelp from "@/components/help/FieldHelp";
import { listMeetings } from "@/lib/meetings-fns";
import { LOCATION_KEYS, STATUS_KEYS, fmt } from "@/lib/labels";
import StatusBadge from "@/components/shared/StatusBadge";
import { Empty, ErrorState, Loading } from "@/components/shared/States";
import { useI18n } from "@/lib/i18n";

export default function MeetingList({ fixedStatuses, initialQuery = "" }) {
  const { t, locale } = useI18n();
  const [f, setF] = useState({ status: "all", type: "all", text: initialQuery, from: "", to: "", organizer: "", participant: "" });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  useEffect(() => {
    setF((p) => ({ ...p, text: initialQuery }));
  }, [initialQuery]);
  const statuses = fixedStatuses || (f.status === "all" ? undefined : [f.status]);
  const { data, isLoading, error } = useQuery({
    queryKey: ["meetings", statuses, f.type, f.text, f.from, f.to, f.organizer, f.participant],
    queryFn: () => listMeetings({
      data: {
        statuses,
        locationType: f.type === "all" ? undefined : f.type,
        text: f.text || undefined,
        from: f.from || undefined,
        to: f.to || undefined,
        organizer: f.organizer || undefined,
        participant: f.participant || undefined,
      },
    }),
  });
  return (
    <div className="space-y-4">
      <div className="card-soft grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <FieldHelp helpKey="list.search" label={t("list.search")} className="lg:col-span-2">
          <Input placeholder={t("search.placeholder")} value={f.text} onChange={set("text")} />
        </FieldHelp>
        {!fixedStatuses && (
          <FieldHelp helpKey="list.status" label={t("common.status")}>
            <Select value={f.status} onValueChange={(v) => setF((p) => ({ ...p, status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.allStatuses")}</SelectItem>
                {STATUS_KEYS.map((k) => <SelectItem key={k} value={k}>{t(`status.${k}`)}</SelectItem>)}
              </SelectContent>
            </Select>
          </FieldHelp>
        )}
        <FieldHelp helpKey="list.type" label={t("list.type")}>
          <Select value={f.type} onValueChange={(v) => setF((p) => ({ ...p, type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("list.allTypes")}</SelectItem>
              {LOCATION_KEYS.map((k) => <SelectItem key={k} value={k}>{t(`location.${k}`)}</SelectItem>)}
            </SelectContent>
          </Select>
        </FieldHelp>
        <FieldHelp helpKey="list.from" label={t("list.from")}><Input type="date" value={f.from} onChange={set("from")} /></FieldHelp>
        <FieldHelp helpKey="list.to" label={t("list.to")}><Input type="date" value={f.to} onChange={set("to")} /></FieldHelp>
        <FieldHelp helpKey="list.organizer" label={t("list.organizer")}><Input placeholder={t("common.email")} value={f.organizer} onChange={set("organizer")} /></FieldHelp>
        <FieldHelp helpKey="list.participant" label={t("list.participant")}><Input placeholder={t("common.email")} value={f.participant} onChange={set("participant")} /></FieldHelp>
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