import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACTION_STATUS_KEYS } from "@/lib/labels";
import { useI18n } from "@/lib/i18n";

export default function ActionStatusSelect({ value, onChange }) {
  const { t } = useI18n();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
      <SelectContent>{ACTION_STATUS_KEYS.map((k) => <SelectItem key={k} value={k}>{t(`action.${k}`)}</SelectItem>)}</SelectContent>
    </Select>
  );
}