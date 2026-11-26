import { createFileRoute } from "@tanstack/react-router";
import AdminPage from "@/components/admin/AdminPage";

export const Route = createFileRoute("/_authed/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Administração · Atas Auditáveis" }] }),
  component: AdminPage,
});