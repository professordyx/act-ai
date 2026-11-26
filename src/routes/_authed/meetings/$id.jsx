import { createFileRoute } from "@tanstack/react-router";
import MeetingDetail from "@/components/meetings/MeetingDetail";

export const Route = createFileRoute("/_authed/meetings/$id")({
  ssr: false,
  head: () => ({ meta: [{ title: "Reunião · Atas Auditáveis" }] }),
  component: function Page() {
    const { id } = Route.useParams();
    return <MeetingDetail id={id} />;
  },
});