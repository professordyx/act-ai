import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Plus, ShieldAlert, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createMeeting, listProfiles } from "@/lib/meetings-fns";
import { useAct } from "@/hooks/use-act";
import { LOCATION } from "@/lib/labels";

function ProfileSelect({ label, role, value, onChange, profiles }) {
  const opts = profiles.filter((p) => p.roles?.includes(role) || p.roles?.includes("admin"));
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
        <SelectContent>{opts.map((p) => <SelectItem key={p.id} value={p.email}>{p.name} ({p.email})</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

export default function MeetingForm() {
  const navigate = useNavigate();
  const { data: profiles = [] } = useQuery({ queryKey: ["profiles"], queryFn: () => listProfiles() });
  const [f, setF] = useState({ title: "", description: "", scheduledAt: "", locationType: "virtual", locationDetails: "", reviewerUserId: "", approverUserId: "", consentCaptured: false });
  const [parts, setParts] = useState([{ name: "", email: "" }]);
  const save = useAct(createMeeting, "Reunião criada");
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const ready = f.title.length >= 3 && f.scheduledAt && f.reviewerUserId && f.approverUserId && f.consentCaptured;
  const submit = async (e) => {
    e.preventDefault();
    const res = await save.mutateAsync({
      ...f,
      scheduledAt: new Date(f.scheduledAt).toISOString(),
      consentRequired: true,
      participants: parts.filter((p) => p.name.trim()),
    });
    navigate({ to: "/meetings/$id", params: { id: res.id } });
  };
  return (
    <form onSubmit={submit} className="card-soft space-y-5 p-5 sm:p-8">
      <div className="space-y-1.5"><Label>Título</Label><Input value={f.title} onChange={set("title")} placeholder="Ex.: Alinhamento semanal da equipe" required /></div>
      <div className="space-y-1.5"><Label>Descrição / pauta</Label><Textarea value={f.description} onChange={set("description")} rows={3} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5"><Label>Data e hora</Label><Input type="datetime-local" value={f.scheduledAt} onChange={set("scheduledAt")} required /></div>
        <div className="space-y-1.5">
          <Label>Tipo</Label>
          <Select value={f.locationType} onValueChange={(v) => setF((p) => ({ ...p, locationType: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(LOCATION).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5"><Label>Local ou link</Label><Input value={f.locationDetails} onChange={set("locationDetails")} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileSelect label="Revisor" role="reviewer" value={f.reviewerUserId} onChange={(v) => setF((p) => ({ ...p, reviewerUserId: v }))} profiles={profiles} />
        <ProfileSelect label="Aprovador" role="approver" value={f.approverUserId} onChange={(v) => setF((p) => ({ ...p, approverUserId: v }))} profiles={profiles} />
      </div>
      <div className="space-y-2">
        <Label>Participantes</Label>
        {parts.map((p, i) => (
          <div key={i} className="flex gap-2">
            <Input placeholder="Nome" value={p.name} onChange={(e) => setParts((l) => l.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
            <Input placeholder="E-mail (opcional)" value={p.email} onChange={(e) => setParts((l) => l.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)))} />
            <Button type="button" variant="ghost" size="icon" onClick={() => setParts((l) => l.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => setParts((l) => [...l, { name: "", email: "" }])}><Plus className="mr-1 h-4 w-4" />Adicionar participante</Button>
      </div>
      <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-2">
          <p>Esta reunião será gravada e transcrita. Os participantes devem ser informados e consentir (LGPD).</p>
          <label className="flex items-center gap-2 font-semibold"><Checkbox checked={f.consentCaptured} onCheckedChange={(v) => setF((p) => ({ ...p, consentCaptured: !!v }))} />Confirmo que os participantes foram informados e estão cientes da gravação.</label>
        </div>
      </div>
      <Button type="submit" disabled={!ready || save.isPending} className="w-full rounded-full font-bold sm:w-auto">{save.isPending ? "Salvando..." : "Criar reunião"}</Button>
    </form>
  );
}