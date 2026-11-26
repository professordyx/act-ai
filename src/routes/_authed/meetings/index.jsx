import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import MeetingList from "@/components/meetings/MeetingList";
import { PageTitle } from "@/components/shared/States";

export const Route = createFileRoute("/_authed/meetings/")({
  ssr: false,
  head: () => ({ meta: [{ title: "Reuniões · Atas Auditáveis" }] }),
  component: () => (
    <div>
      <PageTitle eyebrow="Reuniões" title="Todas as reuniões">
        <Button asChild className="rounded-full font-bold"><Link to="/meetings/new"><Plus className="mr-1 h-4 w-4" />Nova reunião</Link></Button>
      </PageTitle>
      <MeetingList />
    </div>
  ),
});