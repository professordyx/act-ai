import { fmt } from "@/lib/labels";
import { useBillingCopy } from "@/lib/billing-i18n";
import { useI18n } from "@/lib/i18n";

const label = (c, type) => ({
  checkout_iniciado: c.evCheckout,
  assinatura_ativa: c.evActive,
  pagamento_falhou: c.evFailed,
  assinatura_cancelada: c.evCanceled,
  assentos_alterados: c.evSeats,
  plano_expirado: c.evExpired,
}[type] || type);

export default function BillingHistory({ events }) {
  const c = useBillingCopy();
  const { locale } = useI18n();
  return (
    <section className="card-soft p-5">
      <h2 className="font-heading text-lg font-semibold uppercase">{c.history}</h2>
      {!events.length ? <p className="mt-2 text-sm text-muted-foreground">{c.historyEmpty}</p> : (
        <ul className="mt-3 divide-y text-sm">
          {events.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span className="font-semibold">{label(c, e.type)}</span>
              <span className="text-xs text-muted-foreground">
                {fmt(e.created_date, true, locale)}
                {e.amountUsd ? ` · US$ ${e.amountUsd}` : ""}
                {e.seats ? ` · ${e.seats}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}