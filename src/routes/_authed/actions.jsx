import { createFileRoute } from "@tanstack/react-router";
import ActionsPage from "@/components/actions/ActionsPage";

export const Route = createFileRoute("/_authed/actions")({
  ssr: false,
  head: () => ({ meta: [{ title: "Ações · Atas Auditáveis" }] }),
  component: ActionsPage,
});