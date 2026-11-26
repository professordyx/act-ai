import { useI18n } from "@/lib/i18n";

export default function ParticipantsCard({ participants }) {
  const { t } = useI18n();
  return (
    <section className="card-soft p-5">
      <h2 className="mb-3 font-heading text-lg font-semibold uppercase">{t("part.title")}</h2>
      <ul className="space-y-1.5 text-sm">
        {participants.map((p) => (
          <li key={p.id} className="flex justify-between gap-2"><span className="truncate">{p.name}</span><span className="text-xs text-muted-foreground">{t(`meetingRole.${p.roleInMeeting}`)}</span></li>
        ))}
      </ul>
    </section>
  );
}