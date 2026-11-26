import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MeetingRecorder from "@/components/meetings/MeetingRecorder";
import { useI18n } from "@/lib/i18n";

export default function MeetingCreated({ meeting, onOpen }) {
  const { t } = useI18n();
  return (
    <div className="card-soft space-y-4 p-5 sm:p-8">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <h2 className="font-heading text-xl font-semibold uppercase">{t("rec.createdTitle")}</h2>
      </div>
      <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{meeting.title}</span> · {t("rec.createdText")}</p>
      <MeetingRecorder meetingId={meeting.id} />
      <p className="text-xs text-muted-foreground">{t("rec.hint")}</p>
      <div className="border-t pt-4">
        <Button variant="outline" className="w-full rounded-full sm:w-auto" onClick={onOpen}>{t("rec.createdOpen")}</Button>
      </div>
    </div>
  );
}