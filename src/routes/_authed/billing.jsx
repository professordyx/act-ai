import { createFileRoute } from "@tanstack/react-router";
import BillingPage from "@/components/billing/BillingPage";

export const Route = createFileRoute("/_authed/billing")({
  ssr: false,
  validateSearch: (search) => ({ checkout: search.checkout || undefined }),
  head: () => ({ meta: [{ title: "Assinatura · Atas Auditáveis" }] }),
  component: function Page() {
    const { checkout } = Route.useSearch();
    return <BillingPage checkout={checkout} />;
  },
});