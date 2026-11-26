import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { adminListProfiles, seedDemo, upsertProfile } from "@/lib/admin-fns";
import { getMe } from "@/lib/meetings-fns";
import { useAct } from "@/hooks/use-act";
import { ROLE_LABEL } from "@/lib/labels";
import { ErrorState, Loading, PageTitle } from "@/components/shared/States";

const ROLES = Object.keys(ROLE_LABEL).filter((r) => r !== "admin");

function ProfileRow({ p, save }) {
  const toggle = (r) => save.mutate({ email: p.email, fullName: p.fullName, isActive: p.isActive !== false, roles: p.roles?.includes(r) ? p.roles.filter((x) => x !== r) : [...(p.roles || []), r] });
  return (
    <div className="card-soft space-y-2 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0"><div className="truncate font-semibold">{p.fullName}</div><div className="truncate text-xs text-muted-foreground">{p.email}</div></div>
        <label className="flex items-center gap-2 text-xs">Ativo<Switch checked={p.isActive !== false} onCheckedChange={(v) => save.mutate({ email: p.email, fullName: p.fullName, roles: p.roles || [], isActive: v })} /></label>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {ROLES.map((r) => <label key={r} className="flex items-center gap-1.5 text-xs"><Checkbox checked={p.roles?.includes(r)} onCheckedChange={() => toggle(r)} />{ROLE_LABEL[r]}</label>)}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const me = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const isAdmin = me.data?.isAdmin;
  const list = useQuery({ queryKey: ["profiles-admin"], queryFn: () => adminListProfiles(), enabled: !!isAdmin });
  const save = useAct(upsertProfile, "Perfil atualizado");
  const seed = useAct(seedDemo, "Reunião de demonstração criada");
  const [email, setEmail] = useState("");
  if (me.isLoading) return <Loading />;
  if (!isAdmin) return <ErrorState error={{ message: "Área restrita a administradores." }} />;
  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Administração" title="Perfis e permissões" />
      <p className="max-w-2xl text-sm text-muted-foreground">Usuários entram no app por convite (painel da plataforma). Aqui você define os papéis de cada um. Administradores da plataforma têm todos os papéis. Retenção de gravações e segregação de funções (organizador ≠ aprovador) são parâmetros futuros, a validar com Qualidade e Jurídico.</p>
      <form className="flex max-w-xl gap-2" onSubmit={(e) => { e.preventDefault(); save.mutate({ email, roles: ["participant"], isActive: true }, { onSuccess: () => setEmail("") }); }}>
        <Input type="email" placeholder="E-mail para pré-cadastrar perfil" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" disabled={!email}>Adicionar</Button>
      </form>
      {list.isLoading ? <Loading /> : list.error ? <ErrorState error={list.error} /> : <div className="grid gap-3 lg:grid-cols-2">{list.data.map((p) => <ProfileRow key={p.id} p={p} save={save} />)}</div>}
      <div className="card-featured flex flex-wrap items-center justify-between gap-3 p-5">
        <div><div className="font-heading text-lg font-semibold uppercase">Dados de demonstração</div><p className="text-sm text-slate-300">Cria uma reunião interna já transcrita para testar o fluxo.</p></div>
        <Button variant="secondary" disabled={seed.isPending} onClick={() => seed.mutate(undefined, { onSuccess: (r) => navigate({ to: "/meetings/$id", params: { id: r.id } }) })}>Criar reunião de exemplo</Button>
      </div>
    </div>
  );
}