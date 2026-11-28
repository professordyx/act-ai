import { createFileRoute, Link } from "@tanstack/react-router";
import EmbeddedCheckoutForm from "@/components/billing/EmbeddedCheckoutForm";
import { useI18n } from "@/lib/i18n";

const COPY = {
  pt: {
    eyebrow: "Assinatura",
    title: "Pagamento dos assentos",
    lead: "O pagamento é processado pelo Stripe. Você só é cobrado depois de confirmar neste formulário.",
    seats: "assento(s) · US$ 5 por assento/mês",
    back: "Voltar para a assinatura",
    error: "Não foi possível carregar o formulário de pagamento.",
    doneTitle: "Pagamento recebido",
    doneLead: "Assim que o Stripe confirmar a cobrança, os assentos ficam disponíveis na sua conta.",
    doneCta: "Ver minha assinatura",
  },
  en: {
    eyebrow: "Subscription",
    title: "Seat payment",
    lead: "Payment is processed by Stripe. You are only charged after confirming in this form.",
    seats: "seat(s) · US$ 5 per seat/month",
    back: "Back to subscription",
    error: "The payment form could not be loaded.",
    doneTitle: "Payment received",
    doneLead: "As soon as Stripe confirms the charge, the seats become available on your account.",
    doneCta: "View my subscription",
  },
  es: {
    eyebrow: "Suscripción",
    title: "Pago de los asientos",
    lead: "El pago lo procesa Stripe. Solo se te cobra después de confirmar en este formulario.",
    seats: "asiento(s) · US$ 5 por asiento/mes",
    back: "Volver a la suscripción",
    error: "No se pudo cargar el formulario de pago.",
    doneTitle: "Pago recibido",
    doneLead: "En cuanto Stripe confirme el cobro, los asientos estarán disponibles en tu cuenta.",
    doneCta: "Ver mi suscripción",
  },
};

export const Route = createFileRoute("/_authed/checkout")({
  ssr: false,
  validateSearch: (search) => ({
    seats: Number(search.seats) > 0 ? Math.min(Number(search.seats), 50) : 1,
    status: typeof search.status === "string" ? search.status : undefined,
  }),
  head: () => ({ meta: [{ title: "Pagamento · Atas Auditáveis" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { seats, status } = Route.useSearch();
  const { lang } = useI18n();
  const c = COPY[lang] || COPY.pt;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <p className="eyebrow">{c.eyebrow}</p>
      <h1 className="h-display text-3xl sm:text-4xl">{c.title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{c.lead}</p>
      <p className="mt-2 text-sm font-semibold text-secondary">
        {seats} {c.seats}
      </p>

      <div className="card-soft mt-6 p-5 sm:p-6">
        {status === "sucesso" ? (
          <div>
            <h2 className="font-heading text-xl font-semibold uppercase text-secondary">{c.doneTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{c.doneLead}</p>
            <Link to="/billing" className="mt-4 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline">
              {c.doneCta}
            </Link>
          </div>
        ) : (
          <EmbeddedCheckoutForm seats={seats} errorText={c.error} />
        )}
      </div>

      <Link to="/billing" className="mt-6 inline-flex text-sm font-semibold text-secondary/70 underline-offset-4 hover:underline">
        {c.back}
      </Link>
    </div>
  );
}