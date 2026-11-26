import { useRef, useState } from "react";
import { FileAudio, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { addRecording } from "@/lib/meetings-fns";
import { useAct } from "@/hooks/use-act";
import { fmt } from "@/lib/labels";
import { useI18n } from "@/lib/i18n";

export default function RecordingCard({ data }) {
  const { t, locale } = useI18n();
  const { meeting: m, recordings, perms } = data;
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const add = useAct(addRecording, t("toast.recordingUploaded"));
  const locked = ["em_revisao", "aguardando_aprovacao", "aprovada", "arquivada"].includes(m.status);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await add.mutateAsync({ meetingId: m.id, fileName: file.name, fileUri: file_uri, fileSizeBytes: file.size, mimeType: file.type || undefined });
    } catch (err) {
      toast.error(err?.message || t("rec.uploadFailed"));
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };
  const open = async (uri) => {
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 300 });
    window.open(signed_url, "_blank");
  };

  return (
    <section className="card-soft p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold uppercase">{t("rec.title")}</h2>
        {perms.canEdit && !locked && (
          <>
            <input ref={input} type="file" accept="audio/*,video/mp4" className="hidden" onChange={onFile} />
            <Button size="sm" variant="outline" disabled={busy} onClick={() => input.current?.click()}>
              {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}{t("rec.upload")}
            </Button>
          </>
        )}
      </div>
      {recordings.length === 0 ? <p className="text-sm text-muted-foreground">{t("rec.empty")}</p> : (
        <ul className="divide-y">
          {recordings.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="flex min-w-0 items-center gap-2"><FileAudio className="h-4 w-4 shrink-0 text-primary" /><span className="truncate">{r.fileName}</span></span>
              <span className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">{fmt(r.uploadedAt, true, locale)}<button className="font-semibold text-primary" onClick={() => open(r.fileUrl)}>{t("rec.open")}</button></span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}