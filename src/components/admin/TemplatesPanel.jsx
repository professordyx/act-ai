import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createMinutesTemplate, deleteMinutesTemplate, listMinutesTemplates, updateMinutesTemplate } from "@/lib/template-fns";
import { useAct } from "@/hooks/use-act";
import { useI18n } from "@/lib/i18n";

const EMPTY = { id: null, name: "", description: "", prompt: "" };

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function TemplatesPanel() {
  const { t } = useI18n();
  const { data, isLoading } = useQuery({ queryKey: ["minutes-templates"], queryFn: () => listMinutesTemplates() });
  const create = useAct(createMinutesTemplate, t("tpl.created"));
  const update = useAct(updateMinutesTemplate, t("tpl.updated"));
  const remove = useAct(deleteMinutesTemplate, t("tpl.deleted"));
  const [form, setForm] = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = !!form && form.name.trim().length > 1 && form.prompt.trim().length > 9;
  const examples = data?.examples || [];
  const custom = data?.custom || [];

  const save = () => {
    const payload = { name: form.name.trim(), description: form.description.trim() || undefined, prompt: form.prompt };
    const act = form.id ? update : create;
    act.mutate(form.id ? { id: form.id, ...payload } : payload, { onSuccess: () => setForm(null) });
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-heading text-xl font-semibold uppercase">{t("tpl.section")}</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">{t("tpl.description")}</p>
        </div>
        <Button size="sm" onClick={() => setForm({ ...EMPTY })}><Plus className="mr-1 h-4 w-4" />{t("tpl.new")}</Button>
      </div>

      <div>
        <p className="eyebrow mb-2">{t("tpl.examples")}</p>
        <div className="grid gap-3 lg:grid-cols-3">
          {examples.map((e) => (
            <article key={e.key} className="card-soft flex flex-col p-4">
              <h3 className="font-heading text-base font-semibold uppercase">{e.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{e.description}</p>
              <pre className="mt-2 max-h-24 overflow-hidden whitespace-pre-wrap font-body text-xs text-secondary/70">{e.prompt}</pre>
              <Button size="sm" variant="outline" className="mt-3 self-start" onClick={() => setForm({ ...EMPTY, name: `${e.name} ${t("tpl.copySuffix")}`, description: e.description, prompt: e.prompt })}>
                <Copy className="mr-1 h-4 w-4" />{t("tpl.copy")}
              </Button>
            </article>
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow mb-2">{t("tpl.mine")}</p>
        {isLoading ? <p className="text-sm text-muted-foreground">{t("common.loading")}</p> : custom.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("tpl.empty")}</p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {custom.map((c) => (
              <article key={c.id} className="card-soft p-4">
                <h3 className="font-heading text-base font-semibold uppercase">{c.name}</h3>
                {c.description && <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>}
                <pre className="mt-2 max-h-24 overflow-hidden whitespace-pre-wrap font-body text-xs text-secondary/70">{c.prompt}</pre>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setForm({ id: c.id, name: c.name, description: c.description || "", prompt: c.prompt })}><Pencil className="mr-1 h-4 w-4" />{t("tpl.edit")}</Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (window.confirm(t("tpl.confirmDelete"))) remove.mutate({ id: c.id }); }}><Trash2 className="mr-1 h-4 w-4" />{t("tpl.delete")}</Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!form} onOpenChange={(v) => !v && setForm(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{form?.id ? t("tpl.edit") : t("tpl.new")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Field label={t("tpl.name")}><Input value={form?.name || ""} onChange={set("name")} /></Field>
            <Field label={t("tpl.descriptionLabel")}><Input value={form?.description || ""} onChange={set("description")} /></Field>
            <Field label={t("tpl.promptLabel")} hint={t("tpl.promptHint")}>
              <Textarea rows={10} value={form?.prompt || ""} onChange={set("prompt")} className="font-body" />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setForm(null)}>{t("common.cancel")}</Button>
            <Button disabled={!valid || create.isPending || update.isPending} onClick={save}>{t("tpl.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}