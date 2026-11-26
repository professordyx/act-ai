import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listActions, updateAction } from "@/lib/minutes-fns";
import { useAct } from "@/hooks/use-act";
import { ACTION_STATUS_KEYS, fmt } from "@/lib/labels";
import ActionStatusSelect from "@/components/meetings/ActionStatusSelect";
import { Empty, ErrorState, Loading, PageTitle } from "@/components/shared/States";
import { useI18n } from "@/lib/i18n";

export default function ActionsPage() {
  const { t, locale } = useI18n();
  const [status, setStatus] = useState("all");
  const [onlyMine, setOnlyMine] = useState(false);
  const upd = useAct(updateAction);
  const { data, isLoading, error } = useQuery({
    queryKey: ["actions", status, onlyMine],
    queryFn: () => listActions({ data: { status: status === "all" ? undefined : status, onlyMine } }),
  });
  return (
    <div>
      <PageTitle eyebrow={t("actp.eyebrow")} title={t("actp.title")} />
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">{t("common.allStatuses")}</SelectItem>{ACTION_STATUS_KEYS.map((k) => <SelectItem key={k} value={k}>{t(`action.${k}`)}</SelectItem>)}</SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm"><Switch checked={onlyMine} onCheckedChange={setOnlyMine} />{t("actp.onlyMine")}</label>
      </div>
      {isLoading ? <Loading /> : error ? <ErrorState error={error} /> : data.length === 0 ? <Empty text={t("actp.empty")} /> : (
        <div className="grid gap-3">
          {data.map((a) => (
            <div key={a.id} className="card-soft flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="font-semibold">{a.title}</div>
                <div className="text-xs text-muted-foreground">{a.assignedToName || t("act.noOwner")} · {t("act.due")} {fmt(a.dueDate, false, locale)} · <Link to="/meetings/$id" params={{ id: a.meetingId }} className="font-semibold text-primary">{a.meetingTitle}</Link></div>
              </div>
              <ActionStatusSelect value={a.status} onChange={(s) => upd.mutate({ id: a.id, status: s })} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}