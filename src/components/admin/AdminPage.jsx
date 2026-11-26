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
import { ROLE_KEYS } from "@/lib/labels";
import { ErrorState, Loading, PageTitle } from "@/components/shared/States";
import TemplatesPanel from "@/components/admin/TemplatesPanel";
import TranscriptionPanel from "@/components/admin/TranscriptionPanel";
import { useI18n } from "@/lib/i18n";

const ROLES = ROLE_KEYS.filter((r) => r !== "admin");

function ProfileRow({ p, save }) {
  const { t } = useI18n();
  const toggle = (r) => save.mutate({ email: p.email, fullName: p.fullName, isActive: p.isActive !== false, roles: p.roles?.includes(r) ? p.roles.filter((x) => x !== r) : [...(p.roles || []), r] });
  return (
    <div className="card-soft space-y-2 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0"><div className="truncate font-semibold">{p.fullName}</div><div className="truncate text-xs text-muted-foreground">{p.email}</div></div>
        <label className="flex items-center gap-2 text-xs">{t("adm.active")}<Switch checked={p.isActive !== false} onCheckedChange={(v) => save.mutate({ email: p.email, fullName: p.fullName, roles: p.roles || [], isActive: v })} /></label>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {ROLES.map((r) => <label key={r} className="flex items-center gap-1.5 text-xs"><Checkbox checked={p.roles?.includes(r)} onCheckedChange={() => toggle(r)} />{t(`role.${r}`)}</label>)}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const me = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const isAdmin = me.data?.isAdmin;
  const list = useQuery({ queryKey: ["profiles-admin"], queryFn: () => adminListProfiles(), enabled: !!isAdmin });
  const save = useAct(upsertProfile, t("toast.profileUpdated"));
  const seed = useAct(seedDemo, t("toast.demoCreated"));
  const [email, setEmail] = useState("");
  if (me.isLoading) return <Loading />;
  if (!isAdmin) return <ErrorState error={{ message: t("adm.restricted") }} />;
  return (
    <div className="space-y-6">
      <PageTitle eyebrow={t("adm.eyebrow")} title={t("adm.title")} />
      <p className="max-w-2xl text-sm text-muted-foreground">{t("adm.description")}</p>
      <form className="flex max-w-xl gap-2" onSubmit={(e) => { e.preventDefault(); save.mutate({ email, roles: ["participant"], isActive: true }, { onSuccess: () => setEmail("") }); }}>
        <Input type="email" placeholder={t("adm.emailPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" disabled={!email}>{t("common.add")}</Button>
      </form>
      {list.isLoading ? <Loading /> : list.error ? <ErrorState error={list.error} /> : <div className="grid gap-3 lg:grid-cols-2">{list.data.map((p) => <ProfileRow key={p.id} p={p} save={save} />)}</div>}
      <TranscriptionPanel />
      <TemplatesPanel />
      <div className="card-featured flex flex-wrap items-center justify-between gap-3 p-5">
        <div><div className="font-heading text-lg font-semibold uppercase">{t("adm.demoTitle")}</div><p className="text-sm text-slate-300">{t("adm.demoText")}</p></div>
        <Button variant="secondary" disabled={seed.isPending} onClick={() => seed.mutate(undefined, { onSuccess: (r) => navigate({ to: "/meetings/$id", params: { id: r.id } }) })}>{t("adm.demoButton")}</Button>
      </div>
    </div>
  );
}