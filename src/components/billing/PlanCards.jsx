import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBillingCopy } from "@/lib/billing-i18n";

export default function PlanCards({ pricePerSeatUsd, current }) {
  const c = useBillingCopy();
  const plans = [
    { key: "free", name: c.freeName, price: c.freePrice, items: [c.freeL1, c.freeL2, c.freeL3], featured: false },
    { key: "paid", name: c.paidName, price: `${c.pricePrefix}${pricePerSeatUsd}${c.perSeatMonth}`, items: [c.paidL1, c.paidL2, c.paidL3, c.paidL4], featured: true },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {plans.map((p) => (
        <div key={p.key} className={cn("rounded-2xl border p-6", p.featured ? "card-featured border-transparent" : "card-soft")}>
          <div className="flex items-center justify-between gap-2">
            <h3 className={cn("font-heading text-xl font-bold uppercase", p.featured ? "text-white" : "text-secondary")}>{p.name}</h3>
            {current === p.key && (
              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold uppercase", p.featured ? "bg-white/15 text-white" : "bg-primary/10 text-primary")}>{c.current}</span>
            )}
          </div>
          <p className={cn("mt-2 font-heading text-2xl font-bold", p.featured ? "text-white" : "text-secondary")}>{p.price}</p>
          <ul className={cn("mt-4 space-y-2 text-sm", p.featured ? "text-slate-200" : "text-foreground")}>
            {p.items.map((item) => (
              <li key={item} className="flex gap-2"><Check className={cn("mt-0.5 h-4 w-4 shrink-0", p.featured ? "text-emerald-300" : "text-primary")} />{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}