import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listActions } from "@/lib/minutes-fns";
import { updateAction } from "@/lib/minutes-fns";
import { useAct } from "@/hooks/use-act";
import { ACTION_STATUS, fmt } from "@/lib/labels";
import ActionStatusSelect from "@/components/meetings/ActionStatusSelect";
import { Empty, ErrorState, Loading, PageTitle } from "@/components/shared/States";

export default function ActionsPage() {
  const [status, setStatus] = useState("all");
  const [onlyMine, setOnlyMine] = useState(false);
  const upd = useAct(updateAction);
  const { data, isLoading, error } = useQuery({
    queryKey: ["actions", status, onlyMine],
    queryFn: () => listActions({ data: { status: status === "all" ? undefined : status, onlyMine } }),
  });
  return (
    <div>
      <PageTitle eyebrow="Acompanhamento" title="Ações das reuniões" />
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Todos os status</SelectItem>{Object.entries(ACTION_STATUS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm"><Switch checked={onlyMine} onCheckedChange={setOnlyMine} />Somente minhas</label>
      </div>
      {isLoading ? <Loading /> : error ? <ErrorState error={error} /> : data.length === 0 ? <Empty text="Nenhuma ação encontrada." /> : (
        <div className="grid gap-3">
          {data.map((a) => (
            <div key={a.id} className="card-soft flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="font-semibold">{a.title}</div>
                <div className="text-xs text-muted-foreground">{a.assignedToName || "Sem responsável"} · prazo {fmt(a.dueDate, false)} · <Link to="/meetings/$id" params={{ id: a.meetingId }} className="font-semibold text-primary">{a.meetingTitle}</Link></div>
              </div>
              <ActionStatusSelect value={a.status} onChange={(s) => upd.mutate({ id: a.id, status: s })} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}