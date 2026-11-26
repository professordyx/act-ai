import { useQuery } from "@tanstack/react-query";
import { listMinutesTemplates } from "@/lib/template-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";

// Seleção do template aplicado na geração da ata.
// Valores: "system" (prompt padrão), id do template próprio ou "ex:<chave>" (modelo padrão).
export default function TemplatePicker({ value, onChange }) {
  const { t } = useI18n();
  const { data } = useQuery({ queryKey: ["minutes-templates"], queryFn: () => listMinutesTemplates() });
  const custom = data?.custom || [];
  const examples = data?.examples || [];
  return (
    <div className="max-w-sm">
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("tpl.select")}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="system">{t("tpl.system")}</SelectItem>
          {custom.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          {examples.map((e) => <SelectItem key={e.key} value={`ex:${e.key}`}>{e.name}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}