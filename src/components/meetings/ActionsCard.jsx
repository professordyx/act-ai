import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAction, extractActions, updateAction } from "@/lib/minutes-fns";
import { useAct } from "@/hooks/use-act";
import { ACTION_STATUS, fmt } from "@/lib/labels";
import ActionStatusSelect from "@/components/meetings/ActionStatusSelect";

export default function ActionsCard({ data }) {
  const { meeting: m, actions, perms } = data;
  const [f, setF] = useState({ title: "", assignedToName: "", assignedToUserId: "", dueDate: "" });
  const add = useAct(createAction, "Ação criada");
  const extract = useAct(extractActions, "Ações extraídas");
  const upd = useAct(updateAction);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const canAdd = perms.canEdit && !["arquivada"].includes(m.status);
  return (
    <section className="card-soft p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold uppercase">Ações</h2>
        {perms.canEdit && !["aprovada", "arquivada"].includes(m.status) && (
          <Button size="sm" variant="outline" disabled={extract.isPending} onClick={() => extract.mutate({ meetingId: m.id })}>{extract.isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}Extrair com IA</Button>
        )}
      </div>
      {actions.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma ação registrada.</p> : (
        <ul className="divide-y">
          {actions.map((a) => (
            <li key={a.id} className="space-y-1 py-2 text-sm">
              <div className="font-semibold">{a.title}</div>
              <div className="text-xs text-muted-foreground">{a.assignedToName || "Sem responsável"} · prazo {fmt(a.dueDate, false)} · {a.source === "extraida_ia" ? "IA (validar)" : "manual"}</div>
              <ActionStatusSelect value={a.status} onChange={(status) => upd.mutate({ id: a.id, status })} />
            </li>
          ))}
        </ul>
      )}
      {canAdd && (
        <form className="mt-3 space-y-2 border-t pt-3" onSubmit={(e) => { e.preventDefault(); add.mutate({ meetingId: m.id, ...f, assignedToUserId: f.assignedToUserId || undefined, dueDate: f.dueDate || undefined, assignedToName: f.assignedToName || undefined }, { onSuccess: () => setF({ title: "", assignedToName: "", assignedToUserId: "", dueDate: "" }) }); }}>
          <Input placeholder="Nova ação" value={f.title} onChange={set("title")} />
          <div className="grid grid-cols-2 gap-2"><Input placeholder="Responsável" value={f.assignedToName} onChange={set("assignedToName")} /><Input placeholder="E-mail" value={f.assignedToUserId} onChange={set("assignedToUserId")} /></div>
          <div className="flex gap-2"><Input type="date" value={f.dueDate} onChange={set("dueDate")} /><Button type="submit" size="sm" disabled={f.title.trim().length < 2 || add.isPending}>Adicionar</Button></div>
        </form>
      )}
    </section>
  );
}
export { ACTION_STATUS };