import { createFileRoute } from "@tanstack/react-router";
import ManualPage from "@/components/manual/ManualPage";

export const Route = createFileRoute("/_authed/manual")({
  ssr: false,
  validateSearch: (search) => ({ section: typeof search.section === "string" ? search.section : undefined }),
  head: () => ({ meta: [{ title: "Manual de uso · Atas Auditáveis" }] }),
  component: ManualPage,
});