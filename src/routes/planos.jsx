import { createFileRoute } from "@tanstack/react-router";
import PublicPlans from "@/components/billing/PublicPlans";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos · Act AI" },
      { name: "description", content: "Grave, transcreva e receba atas de reuniões com trilha de auditoria. Plano gratuito e assinatura de US$ 5 por usuário/mês." },
    ],
  }),
  component: PublicPlans,
});