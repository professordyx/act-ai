import { createFileRoute } from "@tanstack/react-router";
import MeetingList from "@/components/meetings/MeetingList";
import { PageTitle } from "@/components/shared/States";

export const Route = createFileRoute("/_authed/repository")({
  ssr: false,
  head: () => ({ meta: [{ title: "Repositório · Atas Auditáveis" }] }),
  component: () => (
    <div>
      <PageTitle eyebrow="Repositório" title="Atas aprovadas e arquivadas" />
      <p className="mb-4 max-w-2xl text-sm text-muted-foreground">Consulta somente leitura. Abra uma reunião para ver gravação, transcrição, versões, aprovação (com hash do conteúdo) e a trilha de auditoria.</p>
      <MeetingList fixedStatuses={["aprovada", "arquivada"]} />
    </div>
  ),
});