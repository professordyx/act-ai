import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAction, extractActions, updateAction } from "@/lib/minutes-fns";
import { useAct } from "@/hooks/use-act";
import { fmt } from "@/lib/labels";
import ActionStatusSelect from "@/components/meetings/ActionStatusSelect";
import { useI18n } from "@/lib/i18n";

export default function ActionsCard({ data }) {
  const { t, locale } = useI18n();
  const { meeting: m, actions, perms } = data;
  const [f, setF] = useState({ title: "", assignedToName: "", assignedToUserId: "", dueDate: "" });
  const add = useAct(createAction, t("toast.actionCreated"));
  const extract = useAct(extractActions, t("toast.actionsExtracted"));
  const upd = useAct(updateAction);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const canAdd = perms.canEdit && !["arquivada"].includes(m.status);
  return (
    <section className="card-soft p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold uppercase">{t("act.title")}</h2>
        {perms.canEdit && !["aprovada", "arquivada"].includes(m.status) && (
          <Button size="sm" variant="outline" disabled={extract.isPending} onClick={() => extract.mutate({ meetingId: m.id })}>{extract.isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}{t("act.extract")}</Button>
        )}
      </div>
      {actions.length === 0 ? <p className="text-sm text-muted-foreground">{t("act.empty")}</p> : (
        <ul className="divide-y">
          {actions.map((a) => (
            <li key={a.id} className="space-y-1 py-2 text-sm">
              <div className="font-semibold">{a.title}</div>
              <div className="text-xs text-muted-foreground">{a.assignedToName || t("act.noOwner")} · {t("act.due")} {fmt(a.dueDate, false, locale)} · {a.source === "extraida_ia" ? t("act.fromAi") : t("act.manual")}</div>
              <ActionStatusSelect value={a.status} onChange={(status) => upd.mutate({ id: a.id, status })} />
            </li>
          ))}
        </ul>
      )}
      {canAdd && (
        <form className="mt-3 space-y-2 border-t pt-3" onSubmit={(e) => { e.preventDefault(); add.mutate({ meetingId: m.id, ...f, assignedToUserId: f.assignedToUserId || undefined, dueDate: f.dueDate || undefined, assignedToName: f.assignedToName || undefined }, { onSuccess: () => setF({ title: "", assignedToName: "", assignedToUserId: "", dueDate: "" }) }); }}>
          <Input placeholder={t("act.new")} value={f.title} onChange={set("title")} />
          <div className="grid grid-cols-2 gap-2"><Input placeholder={t("act.owner")} value={f.assignedToName} onChange={set("assignedToName")} /><Input placeholder={t("act.email")} value={f.assignedToUserId} onChange={set("assignedToUserId")} /></div>
          <div className="flex gap-2"><Input type="date" value={f.dueDate} onChange={set("dueDate")} /><Button type="submit" size="sm" disabled={f.title.trim().length < 2 || add.isPending}>{t("act.add")}</Button></div>
        </form>
      )}
    </section>
  );
}