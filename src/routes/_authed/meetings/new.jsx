import { createFileRoute } from "@tanstack/react-router";
import MeetingForm from "@/components/meetings/MeetingForm";
import { PageTitle } from "@/components/shared/States";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authed/meetings/new")({
  ssr: false,
  head: () => ({ meta: [{ title: "Nova reunião · Atas Auditáveis" }] }),
  component: function Page() {
    const { t } = useI18n();
    return (
      <div className="mx-auto max-w-3xl">
        <PageTitle eyebrow={t("mt.eyebrow")} title={t("mt.newTitle")} />
        <MeetingForm />
      </div>
    );
  },
});