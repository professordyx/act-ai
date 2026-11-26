import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { MOCK_TRANSCRIPT, audit, db, fail, getMeetingFor, hasRole, loadMe } from "@/lib/meeting-core";

const post = () => createServerFn({ method: "POST" }).middleware([requireUser]);
const str = (n) => z.string().max(n);

export const getMe = post().handler(async ({ context }) => {
  const me = await loadMe(db(context), context.user);
  return me;
});

export const listProfiles = post().handler(async ({ context }) => {
  const sdb = db(context);
  await loadMe(sdb, context.user);
  const r = await sdb.entities.UserProfile.filter({ isActive: true }, { limit: 300 });
  return r.items.map((p) => ({ id: p.id, name: p.fullName, email: p.email, roles: p.roles }));
});

export const createMeeting = post()
  .validator(
    z.object({
      title: str(200).min(3),
      description: str(2000).optional(),
      scheduledAt: str(40),
      locationType: z.enum(["presencial", "virtual", "hibrida"]),
      locationDetails: str(300).optional(),
      reviewerUserId: str(200).email(),
      approverUserId: str(200).email(),
      consentRequired: z.boolean(),
      consentCaptured: z.boolean(),
      participants: z.array(z.object({ name: str(120).min(1), email: str(200).optional(), roleInMeeting: str(30).optional() })).max(60),
    }),
  )
  .handler(async ({ context, data }) => {
    const sdb = db(context);
    const me = await loadMe(sdb, context.user);
    if (!hasRole(me, "organizer")) fail("Apenas organizadores podem criar reuniões", 403);
    if (data.consentRequired && !data.consentCaptured) fail("Confirme o consentimento/ciência de gravação dos participantes");
    const m = await sdb.entities.Meeting.create({
      title: data.title,
      description: data.description,
      scheduledAt: new Date(data.scheduledAt).toISOString(),
      locationType: data.locationType,
      locationDetails: data.locationDetails,
      organizerUserId: me.email,
      reviewerUserId: data.reviewerUserId.toLowerCase(),
      approverUserId: data.approverUserId.toLowerCase(),
      consentRequired: data.consentRequired,
      consentCaptured: data.consentCaptured,
      status: "aguardando_upload",
    });
    const parts = [{ name: me.name, email: me.email, roleInMeeting: "organizador" }, ...data.participants];
    await sdb.entities.MeetingParticipant.bulkCreate(
      parts.map((p) => ({
        meetingId: m.id,
        name: p.name,
        email: p.email ? p.email.toLowerCase() : undefined,
        roleInMeeting: p.roleInMeeting || "participante",
        attendanceStatus: "desconhecido",
      })),
    );
    await audit(sdb, me, { entityType: "meeting", entityId: m.id, meetingId: m.id, eventType: "reuniao_criada", description: `Reunião "${m.title}" criada`, next: { status: m.status, consentCaptured: data.consentCaptured } });
    return { id: m.id };
  });

async function visibleMeetings(sdb, me, query) {
  const page = await sdb.entities.Meeting.filter(query, { sort: "-scheduledAt", limit: 300 });
  const priv = me.isAdmin || me.roles.includes("auditor");
  const mine = priv ? [] : (await sdb.entities.MeetingParticipant.filter({ email: me.email }, { limit: 500 })).items.map((p) => p.meetingId);
  return page.items.filter((m) => {
    if (priv || m.organizerUserId === me.email || m.reviewerUserId === me.email || m.approverUserId === me.email) return true;
    return mine.includes(m.id) && ["aprovada", "arquivada"].includes(m.status);
  });
}

export const listMeetings = post()
  .validator(
    z.object({
      statuses: z.array(str(40)).max(12).optional(),
      organizer: str(200).optional(),
      participant: str(200).optional(),
      from: str(40).optional(),
      to: str(40).optional(),
      text: str(100).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sdb = db(context);
    const me = await loadMe(sdb, context.user);
    const q = {};
    if (data.statuses?.length) q.status = { $in: data.statuses };
    if (data.organizer) q.organizerUserId = data.organizer.toLowerCase();
    if (data.from || data.to) {
      q.scheduledAt = {};
      if (data.from) q.scheduledAt.$gte = new Date(data.from).toISOString();
      if (data.to) q.scheduledAt.$lte = new Date(data.to + "T23:59:59").toISOString();
    }
    let items = await visibleMeetings(sdb, me, q);
    if (data.participant) {
      const ids = (await sdb.entities.MeetingParticipant.filter({ email: data.participant.toLowerCase() }, { limit: 500 })).items.map((p) => p.meetingId);
      items = items.filter((m) => ids.includes(m.id));
    }
    if (data.text) items = items.filter((m) => m.title.toLowerCase().includes(data.text.toLowerCase()));
    return items.map((m) => ({ id: m.id, title: m.title, scheduledAt: m.scheduledAt, status: m.status, organizerUserId: m.organizerUserId, reviewerUserId: m.reviewerUserId, approverUserId: m.approverUserId, locationType: m.locationType }));
  });

export const getDashboard = post().handler(async ({ context }) => {
  const sdb = db(context);
  const me = await loadMe(sdb, context.user);
  const meetings = await visibleMeetings(sdb, me, {});
  const count = (s) => meetings.filter((m) => m.status === s).length;
  const brief = (m) => ({ id: m.id, title: m.title, scheduledAt: m.scheduledAt, status: m.status });
  const priv = me.isAdmin || me.roles.includes("auditor");
  const ids = meetings.map((m) => m.id);
  const open = { status: { $in: ["aberta", "em_andamento"] } };
  const actions = priv
    ? (await sdb.entities.ActionItem.filter(open, { sort: "dueDate", limit: 200 })).items
    : (await sdb.entities.ActionItem.filter({ ...open, assignedToUserId: me.email }, { limit: 200 })).items;
  const approved = meetings.filter((m) => m.status === "aprovada" || m.status === "arquivada").length;
  const decided = approved + count("rejeitada");
  let avgHours = null;
  if (priv) {
    const ap = (await sdb.entities.Approval.filter({ decision: "aprovado" }, { limit: 200 })).items;
    const t = ap.map((a) => { const m = meetings.find((x) => x.id === a.meetingId); return m ? (new Date(a.created_date) - new Date(m.created_date)) / 36e5 : null; }).filter((x) => x !== null);
    if (t.length) avgHours = Math.round(t.reduce((a, b) => a + b, 0) / t.length);
  }
  return {
    counts: { total: meetings.length, aguardando_upload: count("aguardando_upload"), em_revisao: count("em_revisao"), aguardando_aprovacao: count("aguardando_aprovacao"), aprovada: approved, rejeitada: count("rejeitada"), acoes: actions.length },
    metrics: { approvedPct: meetings.length ? Math.round((approved / meetings.length) * 100) : 0, rejectedPct: decided ? Math.round((count("rejeitada") / decided) * 100) : 0, avgHours },
    pendingReviews: meetings.filter((m) => m.status === "em_revisao" && m.reviewerUserId === me.email).map(brief),
    pendingApprovals: meetings.filter((m) => m.status === "aguardando_aprovacao" && m.approverUserId === me.email).map(brief),
    pendingUploads: meetings.filter((m) => ["aguardando_upload", "gravacao_enviada", "transcrito", "minuta_gerada", "rejeitada"].includes(m.status) && m.organizerUserId === me.email).map(brief),
    myActions: actions.filter((a) => ids.includes(a.meetingId)).slice(0, 8).map((a) => ({ id: a.id, title: a.title, dueDate: a.dueDate, status: a.status, meetingId: a.meetingId })),
  };
});

export const getMeetingDetails = post()
  .validator(z.object({ id: str(60) }))
  .handler(async ({ context, data }) => {
    const sdb = db(context);
    const me = await loadMe(sdb, context.user);
    const { m, rel } = await getMeetingFor(sdb, me, data.id);
    const f = (E, q, sort) => sdb.entities[E].filter(q, { sort, limit: 200 }).then((r) => r.items);
    const [participants, approvals, actions] = await Promise.all([f("MeetingParticipant", { meetingId: m.id }), f("Approval", { meetingId: m.id }, "-created_date"), f("ActionItem", { meetingId: m.id }, "created_date")]);
    const minutes = m.latestMinutesId ? await sdb.entities.Minutes.get(m.latestMinutesId).catch(() => null) : null;
    const base = { meeting: m, participants, minutes, approvals, actions };
    const perms = {
      canEdit: rel.canEdit,
      canSubmit: (rel.organizer || me.isAdmin) && !!minutes && ["rascunho", "rejeitada"].includes(minutes.status),
      canReview: (rel.reviewer && hasRole(me, "reviewer")) || me.isAdmin,
      canApprove: (rel.approver && hasRole(me, "approver")) || me.isAdmin,
      isAdmin: me.isAdmin,
      full: rel.full,
    };
    if (!rel.full) return { ...base, perms, recordings: [], transcript: null, versions: [], audit: [], approvals };
    const [recordings, versions, logs] = await Promise.all([f("Recording", { meetingId: m.id }, "-created_date"), f("MinutesVersion", { meetingId: m.id }, "-version"), f("AuditLog", { meetingId: m.id }, "-created_date")]);
    const transcript = m.latestTranscriptId ? await sdb.entities.Transcript.get(m.latestTranscriptId).catch(() => null) : null;
    return { ...base, perms, recordings, transcript, versions, audit: logs };
  });

export const addRecording = post()
  .validator(z.object({ meetingId: str(60), fileName: str(255), fileUri: str(600), fileSizeBytes: z.number().optional(), mimeType: str(100).optional(), durationSeconds: z.number().optional() }))
  .handler(async ({ context, data }) => {
    const sdb = db(context);
    const me = await loadMe(sdb, context.user);
    const { m, rel } = await getMeetingFor(sdb, me, data.meetingId);
    if (!rel.canEdit) fail("Sem permissão para enviar gravação", 403);
    if (["em_revisao", "aguardando_aprovacao", "aprovada", "arquivada"].includes(m.status)) fail("A reunião não aceita novas gravações neste status");
    const r = await sdb.entities.Recording.create({ meetingId: m.id, fileName: data.fileName, fileUrl: data.fileUri, fileSizeBytes: data.fileSizeBytes, mimeType: data.mimeType, durationSeconds: data.durationSeconds, uploadedByUserId: me.email, uploadedAt: new Date().toISOString(), processingStatus: "enviado" });
    await sdb.entities.Meeting.update(m.id, { latestRecordingId: r.id, status: m.status === "aguardando_upload" ? "gravacao_enviada" : m.status });
    await audit(sdb, me, { entityType: "recording", entityId: r.id, meetingId: m.id, eventType: "gravacao_enviada", description: `Gravação "${data.fileName}" enviada (armazenamento privado)` });
    return { id: r.id };
  });

// Modos: "auto" (TranscribeAudio, Whisper, até 25MB), "manual" (texto colado), "mock" (demonstração).
// LIMITAÇÃO MVP: sem diarização de falantes. EVOLUÇÃO: provedor próprio/local ("provider_future").
export const transcribeRecording = post()
  .validator(z.object({ meetingId: str(60), recordingId: str(60).optional(), mode: z.enum(["auto", "manual", "mock"]), text: z.string().max(200000).optional() }))
  .handler(async ({ context, data }) => {
    const sdb = db(context);
    const me = await loadMe(sdb, context.user);
    const { m, rel } = await getMeetingFor(sdb, me, data.meetingId);
    if (!rel.canEdit) fail("Sem permissão", 403);
    if (["em_revisao", "aguardando_aprovacao", "aprovada", "arquivada"].includes(m.status)) fail("A transcrição não pode ser refeita neste status");
    const rec = data.recordingId ? await sdb.entities.Recording.get(data.recordingId).catch(() => null) : null;
    if (data.mode !== "manual" && !rec) fail("Envie uma gravação válida antes de transcrever");
    if (data.mode === "manual" && !data.text?.trim()) fail("Cole o texto da transcrição");
    const t = await sdb.entities.Transcript.create({ meetingId: m.id, recordingId: rec?.id, language: "pt-BR", content: "", status: "processando", source: data.mode === "auto" ? "automatica" : data.mode, createdByUserId: me.email });
    await sdb.entities.Meeting.update(m.id, { status: "processando_transcricao" });
    await audit(sdb, me, { entityType: "transcript", entityId: t.id, meetingId: m.id, eventType: "transcricao_iniciada", description: `Transcrição iniciada (modo ${data.mode})` });
    try {
      let content = data.text || "";
      if (data.mode === "mock") {
        const parts = await sdb.entities.MeetingParticipant.filter({ meetingId: m.id });
        content = MOCK_TRANSCRIPT(m.title, parts.map((p) => p.name.split(" ")[0]));
      }
      if (data.mode === "auto") {
        rec && (await sdb.entities.Recording.update(rec.id, { processingStatus: "processando" }));
        content = await sdb.integrations.Core.TranscribeAudio({ audio_url: rec.fileUrl });
        if (typeof content !== "string") content = content?.text || JSON.stringify(content);
      }
      if (!content.trim()) throw new Error("Transcrição vazia");
      await sdb.entities.Transcript.update(t.id, { content, status: "concluida" });
      rec && (await sdb.entities.Recording.update(rec.id, { processingStatus: "concluido" }));
      await sdb.entities.Meeting.update(m.id, { status: "transcrito", latestTranscriptId: t.id });
      await audit(sdb, me, { entityType: "transcript", entityId: t.id, meetingId: m.id, eventType: "transcricao_concluida", description: "Transcrição concluída" });
      return { id: t.id };
    } catch (err) {
      await sdb.entities.Transcript.update(t.id, { status: "falhou", errorMessage: String(err?.message || err).slice(0, 500) });
      rec && (await sdb.entities.Recording.update(rec.id, { processingStatus: "falhou" }));
      await sdb.entities.Meeting.update(m.id, { status: m.latestTranscriptId ? "transcrito" : "gravacao_enviada" });
      await audit(sdb, me, { entityType: "transcript", entityId: t.id, meetingId: m.id, eventType: "transcricao_falhou", description: String(err?.message || err).slice(0, 300) });
      fail("Não foi possível transcrever automaticamente. Cole a transcrição manualmente ou use o modo demonstração.", 502);
    }
  });