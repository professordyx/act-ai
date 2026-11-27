import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import MeetingList from "@/components/meetings/MeetingList";
import { PageTitle } from "@/components/shared/States";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authed/meetings/")({
  ssr: false,
  validateSearch: (search) => ({ q: typeof search.q === "string" ? search.q : undefined }),
  head: () => ({ meta: [{ title: "Reuniões · Atas Auditáveis" }] }),
  component: function Page() {
    const { t } = useI18n();
    const { q } = Route.useSearch();
    return (
      <div>
        <PageTitle eyebrow={t("mt.eyebrow")} title={t("mt.title")}>
          <Button asChild className="rounded-full font-bold"><Link to="/meetings/new"><Plus className="mr-1 h-4 w-4" />{t("common.newMeeting")}</Link></Button>
        </PageTitle>
        <MeetingList initialQuery={q || ""} />
      </div>
    );
  },
});