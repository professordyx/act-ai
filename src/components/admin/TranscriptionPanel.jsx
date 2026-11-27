import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { KeyRound, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTranscriptionSettings, removeTranscriptionSettings, saveTranscriptionSettings } from "@/lib/transcription-fns";
import FieldHelp from "@/components/help/FieldHelp";
import { useAct } from "@/hooks/use-act";
import { useI18n } from "@/lib/i18n";

export default function TranscriptionPanel() {
  const { t } = useI18n();
  const { data, isLoading } = useQuery({ queryKey: ["transcription-settings"], queryFn: () => getTranscriptionSettings() });
  const save = useAct(saveTranscriptionSettings, t("tx.saved"));
  const remove = useAct(removeTranscriptionSettings, t("tx.removed"));
  const providers = data?.providers || [];
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-4o-transcribe");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (!data?.configured) return;
    setProvider(data.provider);
    setModel(data.model);
  }, [data?.configured, data?.provider, data?.model]);

  const pickProvider = (id) => {
    setProvider(id);
    setModel(providers.find((p) => p.id === id)?.models?.[0]?.id || "");
  };
  const models = providers.find((p) => p.id === provider)?.models || [];
  const typed = apiKey.trim();
  const canSave = !!model && (typed.length === 0 || typed.length >= 10) && (!!data?.configured || typed.length >= 10);

  return (
    <section className="card-soft space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold uppercase">{t("tx.section")}</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">{t("tx.description")}</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold text-secondary">
          {data?.configured ? <ShieldCheck className="h-3.5 w-3.5 text-primary" /> : <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />}
          {data?.configured ? t("tx.configured", { last4: data.last4 }) : t("tx.notConfigured")}
        </span>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-3">
          <FieldHelp helpKey="tx.provider" label={t("tx.provider")}>
            <Select value={provider} onValueChange={pickProvider}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{providers.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}</SelectContent>
            </Select>
          </FieldHelp>
          <FieldHelp helpKey="tx.model" label={t("tx.model")}>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{models.map((m) => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}</SelectContent>
            </Select>
          </FieldHelp>
          <FieldHelp helpKey="tx.key" label={t("tx.key")}>
            <Input type="password" autoComplete="off" value={apiKey} placeholder={data?.configured ? "•••• ••••" : t("tx.keyPlaceholder")} onChange={(e) => setApiKey(e.target.value)} />
          </FieldHelp>
        </div>
      )}

      <p className="text-xs text-muted-foreground">{t(`tx.hint.${provider}`)} {t("tx.keyHint")}</p>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" disabled={!canSave || save.isPending} onClick={() => save.mutate({ provider, model, apiKey: typed.length >= 10 ? typed : undefined }, { onSuccess: () => setApiKey("") })}>{t("tx.save")}</Button>
        {data?.configured && (
          <Button size="sm" variant="ghost" disabled={remove.isPending} onClick={() => { if (window.confirm(t("tx.confirmRemove"))) remove.mutate(undefined); }}>
            <Trash2 className="mr-1 h-4 w-4" />{t("tx.remove")}
          </Button>
        )}
        {data?.configured && data.updatedByEmail && <span className="text-xs text-muted-foreground">{t("tx.updatedBy", { email: data.updatedByEmail })}</span>}
      </div>
    </section>
  );
}