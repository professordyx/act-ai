import { createFileRoute } from "@tanstack/react-router";
import MeetingList from "@/components/meetings/MeetingList";
import { PageTitle } from "@/components/shared/States";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authed/repository")({
  ssr: false,
  head: () => ({ meta: [{ title: "Repositório · Atas Auditáveis" }] }),
  component: function Page() {
    const { t } = useI18n();
    return (
      <div>
        <PageTitle eyebrow={t("repo.eyebrow")} title={t("repo.title")} />
        <p className="mb-4 max-w-2xl text-sm text-muted-foreground">{t("repo.description")}</p>
        <MeetingList fixedStatuses={["aprovada", "arquivada"]} />
      </div>
    );
  },
});