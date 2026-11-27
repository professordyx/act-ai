import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/components/dashboard/Dashboard";

export const Route = createFileRoute("/_authed/dashboard")({
  ssr: false,
  head: () => ({ meta: [{ title: "Painel · Atas Auditáveis" }] }),
  component: Dashboard,
});