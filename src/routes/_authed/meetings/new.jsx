import { createFileRoute } from "@tanstack/react-router";
import MeetingForm from "@/components/meetings/MeetingForm";
import { PageTitle } from "@/components/shared/States";

export const Route = createFileRoute("/_authed/meetings/new")({
  ssr: false,
  head: () => ({ meta: [{ title: "Nova reunião · Atas Auditáveis" }] }),
  component: () => (
    <div className="mx-auto max-w-3xl">
      <PageTitle eyebrow="Reuniões" title="Nova reunião" />
      <MeetingForm />
    </div>
  ),
});