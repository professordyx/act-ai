import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atas Auditáveis · Menos atrito, mais controle" },
      {
        name: "description",
        content:
          "Grave, transcreva, revise e aprove formalmente cada ata de reunião, com rastreabilidade total sob o controle da sua organização.",
      },
    ],
  }),
  component: LandingPage,
});