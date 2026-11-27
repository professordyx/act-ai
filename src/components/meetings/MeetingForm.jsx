import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Plus, ShieldAlert, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createMeeting, listProfiles } from "@/lib/meetings-fns";
import MeetingCreated from "@/components/meetings/MeetingCreated";
import { useAct } from "@/hooks/use-act";
import { LOCATION_KEYS } from "@/lib/labels";
import { LANGS, useI18n } from "@/lib/i18n";
import FieldHelp from "@/components/help/FieldHelp";
import HelpTip from "@/components/help/HelpTip";

function ProfileSelect({ helpKey, role, value, onChange, profiles }) {
  const { t } = useI18n();
  const opts = profiles.filter((p) => p.roles?.includes(role) || p.roles?.includes("admin"));
  return (
    <FieldHelp helpKey={helpKey}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder={t("common.select")} /></SelectTrigger>
        <SelectContent>{opts.map((p) => <SelectItem key={p.id} value={p.email}>{p.name} ({p.email})</SelectItem>)}</SelectContent>
      </Select>
      {opts.length === 0 && <p className="text-xs text-amber-700">{t("form.noProfiles")}</p>}
    </FieldHelp>
  );
}

export default function MeetingForm() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { data: profiles = [] } = useQuery({ queryKey: ["profiles"], queryFn: () => listProfiles() });
  const [f, setF] = useState({ title: "", description: "", language: lang || "pt", scheduledAt: "", locationType: "virtual", locationDetails: "", reviewerUserId: "", approverUserId: "", consentCaptured: false });
  const [parts, setParts] = useState([{ name: "", email: "" }]);
  const [created, setCreated] = useState(null);
  const save = useAct(createMeeting, t("toast.meetingCreated"));
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const ready = f.title.length >= 3 && f.scheduledAt && f.reviewerUserId && f.approverUserId && f.consentCaptured;
  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await save.mutateAsync({
        ...f,
        scheduledAt: new Date(f.scheduledAt).toISOString(),
        consentRequired: true,
        participants: parts.filter((p) => p.name.trim()),
      });
      setCreated({ id: res.id, title: f.title });
    } catch {
      // A mensagem de erro já é exibida no aviso.
    }
  };
  if (created) {
    return <MeetingCreated meeting={created} onOpen={() => navigate({ to: "/meetings/$id", params: { id: created.id } })} />;
  }
  return (
    <form onSubmit={submit} className="card-soft space-y-5 p-5 sm:p-8">
      <FieldHelp helpKey="meeting.title">
        <Input value={f.title} onChange={set("title")} placeholder={t("form.titlePlaceholder")} required />
      </FieldHelp>
      <FieldHelp helpKey="meeting.description">
        <Textarea value={f.description} onChange={set("description")} rows={3} />
      </FieldHelp>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FieldHelp helpKey="meeting.date">
          <Input type="datetime-local" value={f.scheduledAt} onChange={set("scheduledAt")} required />
        </FieldHelp>
        <FieldHelp helpKey="meeting.type">
          <Select value={f.locationType} onValueChange={(v) => setF((p) => ({ ...p, locationType: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{LOCATION_KEYS.map((k) => <SelectItem key={k} value={k}>{t(`location.${k}`)}</SelectItem>)}</SelectContent>
          </Select>
        </FieldHelp>
        <FieldHelp helpKey="meeting.language">
          <Select value={f.language} onValueChange={(v) => setF((p) => ({ ...p, language: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{LANGS.map((l) => <SelectItem key={l.code} value={l.code}>{t(`lang.${l.code}`)}</SelectItem>)}</SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{t("form.languageHint")}</p>
        </FieldHelp>
      </div>
      <FieldHelp helpKey="meeting.location">
        <Input value={f.locationDetails} onChange={set("locationDetails")} />
      </FieldHelp>
      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileSelect helpKey="meeting.reviewer" role="reviewer" value={f.reviewerUserId} onChange={(v) => setF((p) => ({ ...p, reviewerUserId: v }))} profiles={profiles} />
        <ProfileSelect helpKey="meeting.approver" role="approver" value={f.approverUserId} onChange={(v) => setF((p) => ({ ...p, approverUserId: v }))} profiles={profiles} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium leading-none">{t("form.participants")}</span>
          <HelpTip helpKey="meeting.participants" />
        </div>
        {parts.map((p, i) => (
          <div key={i} className="flex gap-2">
            <Input placeholder={t("form.name")} value={p.name} onChange={(e) => setParts((l) => l.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
            <Input placeholder={t("form.emailOptional")} value={p.email} onChange={(e) => setParts((l) => l.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)))} />
            <Button type="button" variant="ghost" size="icon" onClick={() => setParts((l) => l.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => setParts((l) => [...l, { name: "", email: "" }])}><Plus className="mr-1 h-4 w-4" />{t("form.addParticipant")}</Button>
      </div>
      <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-2">
          <p>{t("form.consent")}</p>
          <div className="flex items-center gap-1.5">
            <label className="flex items-center gap-2 font-semibold">
              <Checkbox checked={f.consentCaptured} onCheckedChange={(v) => setF((p) => ({ ...p, consentCaptured: !!v }))} />
              {t("form.consentCheck")}
            </label>
            <HelpTip helpKey="meeting.consent" />
          </div>
        </div>
      </div>
      <Button type="submit" disabled={!ready || save.isPending} className="w-full rounded-full font-bold sm:w-auto">{save.isPending ? t("common.saving") : t("form.submit")}</Button>
    </form>
  );
}