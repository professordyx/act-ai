import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Mic, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { addRecording } from "@/lib/meetings-fns";
import { useAct } from "@/hooks/use-act";
import { useI18n } from "@/lib/i18n";
import { useBillingCopy } from "@/lib/billing-i18n";

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];

function pickMime() {
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) return "";
  return MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m)) || "";
}

function clock(total) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function MeetingRecorder({ meetingId, onSaved, maxSeconds = 0 }) {
  const { t } = useI18n();
  const c = useBillingCopy();
  const limit = maxSeconds || 0;
  const add = useAct(addRecording, t("toast.recordingUploaded"));
  const [phase, setPhase] = useState("idle");
  const [seconds, setSeconds] = useState(0);
  const recorder = useRef(null);
  const chunks = useRef([]);
  const stream = useRef(null);
  const startedAt = useRef(0);

  const release = () => {
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
  };

  useEffect(() => () => release(), []);

  useEffect(() => {
    if (phase !== "recording") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Plano gratuito: encerra a gravação automaticamente ao atingir o limite de duração.
  useEffect(() => {
    if (phase !== "recording" || !limit || seconds < limit) return;
    toast.info(c.freeL2);
    if (recorder.current?.state === "recording") recorder.current.stop();
    release();
    setPhase("saving");
  }, [seconds, phase, limit]);

  const persist = async (mimeType) => {
    const type = (mimeType || "audio/webm").split(";")[0];
    const ext = type.includes("ogg") ? "ogg" : type.includes("mp4") ? "m4a" : "webm";
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const file = new File([new Blob(chunks.current, { type })], `gravacao-${stamp}.${ext}`, { type });
    let fileUri;
    try {
      const uploaded = await base44.integrations.Core.UploadPrivateFile({ file });
      fileUri = uploaded.file_uri;
    } catch (err) {
      toast.error(err?.message || t("rec.uploadFailed"));
      setPhase("idle");
      return;
    }
    try {
      await add.mutateAsync({
        meetingId,
        fileName: file.name,
        fileUri,
        fileSizeBytes: file.size,
        mimeType: type,
        durationSeconds: Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)),
      });
      setPhase("done");
      onSaved?.();
    } catch {
      setPhase("idle");
    }
  };

  const start = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = media;
      chunks.current = [];
      const mimeType = pickMime();
      const mr = new MediaRecorder(media, mimeType ? { mimeType } : undefined);
      mr.ondataavailable = (event) => {
        if (event.data?.size) chunks.current.push(event.data);
      };
      mr.onstop = () => persist(mr.mimeType || mimeType);
      mr.start(1000);
      recorder.current = mr;
      startedAt.current = Date.now();
      setSeconds(0);
      setPhase("recording");
    } catch {
      release();
      toast.error(t("rec.denied"));
    }
  };

  const stop = () => {
    if (recorder.current?.state === "recording") recorder.current.stop();
    release();
    setPhase("saving");
  };

  if (phase === "done") {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <p className="flex-1 text-sm font-semibold">{t("rec.saved")}</p>
        <Button variant="outline" size="sm" onClick={() => setPhase("idle")}>{t("rec.recordAgain")}</Button>
      </div>
    );
  }

  if (phase === "saving") {
    return (
      <div className="flex items-center gap-3 rounded-xl border p-4 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />{t("rec.saving")}
      </div>
    );
  }

  if (phase === "recording") {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4">
        <span className="flex items-center gap-2 text-sm font-semibold text-destructive">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-destructive" />
          {t("rec.recording")}
        </span>
        <span className="font-mono text-lg font-semibold tabular-nums">{clock(seconds)}{limit ? ` / ${clock(limit)}` : ""}</span>
        <Button variant="destructive" size="sm" className="ml-auto rounded-full" onClick={stop}>
          <Square className="mr-1 h-4 w-4" />{t("rec.stop")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Button className="rounded-full font-bold" onClick={start}>
        <Mic className="mr-2 h-4 w-4" />{t("rec.start")}
      </Button>
      {limit > 0 && <p className="text-xs text-muted-foreground">{c.freeL2}</p>}
    </div>
  );
}