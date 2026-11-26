import { STATUS } from "@/lib/labels";

export default function StatusBadge({ status }) {
  const [label, cls] = STATUS[status] || [status, "bg-slate-100 text-slate-700"];
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
}