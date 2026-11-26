import { STATUS_CLASS } from "@/lib/labels";
import { useI18n } from "@/lib/i18n";

export default function StatusBadge({ status }) {
  const { t } = useI18n();
  const cls = STATUS_CLASS[status] || "bg-slate-100 text-slate-700";
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{t(`status.${status}`)}</span>;
}