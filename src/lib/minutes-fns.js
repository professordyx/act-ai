import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { ACTIONS_SCHEMA, MINUTES_SCHEMA, audit, db, fail, getMeetingFor, hasRole, isoOrUndefined, langName, loadMe, meetingLanguage, minutesPrompt, notify, sha256 } from "@/lib/meeting-core";
import { resolveTemplate } from "@/lib/minutes-templates";

const id = z.string().max(60);
const LOCKED = ["em_revisao", "aguardando_aprovacao", "aprovada", "arquivada"];

async function addVersion(sdb, me, m, minutes, summary, templateName) {
  await sdb.entities.MinutesVersion.create({ meetingId: m.id, minutesId: minutes.id, version: minutes.version, content: minutes.content, changeSummary: summary, generatedBy: minutes.generatedBy, templateName, createdByUserId: me.email });
}

async function createActions(sdb, m, minutesId, actions) {
  await sdb.entities.ActionItem.deleteMany({ meetingId: m.id, source: "extraida_ia", status: "aberta" });
  const rows = (actions || []).filter((a) => a.title).map((a) => ({
    meetingId: m.id, minutesId, title: String(a.title).slice(0, 300), description: a.description ? String(a.description).slice(0, 1000) : undefined,
    assignedToName: a.assignedToName || undefined, dueDate: isoOrUndefined(a.dueDate), status: "aberta", source: "extraida_ia",
  }));
  if (rows.length) await sdb.entities.ActionItem.bulkCreate(rows);
  return rows.length;
}

export const generateMinutes = createServerFn({ method: "POST" }).middleware([requireUser])
  .validator(z.object({ meetingId: id, templateId: id.optional(), templateKey: z.string().max(60).optional() }))
  .handler(async ({ context, data }) => {
    const sdb = db(context);
    const me = await loadMe(sdb, context.user);
    const { m, rel } = await getMeetingFor(sdb, me, data.meetingId);
    if (!rel.canEdit) fail("Sem permissão", 403);
    if (LOCKED.includes(m.status)) fail("A ata não pode ser regenerada neste status");
    const tpl = await resolveTemplate(sdb, { id: data.templateId, key: data.templateKey });
    const t = m.latestTranscriptId ? await sdb.entities.Transcript.get(m.latestTranscriptId).catch(() => null) : null;
    if (!t || t.status !== "concluida") fail("A transcrição precisa estar concluída");
    const parts = await sdb.entities.MeetingParticipant.filter({ meetingId: m.id });
    let res;
    try {
      res = await sdb.integrations.Core.InvokeLLM({ prompt: minutesPrompt(m, parts, t.content, tpl), response_json_schema: MINUTES_SCHEMA });
    } catch (err) {
      await audit(sdb, me, { entityType: "minutes", entityId: m.latestMinutesId || m.id, meetingId: m.id, eventType: "geracao_falhou", description: String(err?.message || err).slice(0, 300) });
      fail("Falha ao gerar a minuta com IA. Tente novamente ou escreva a ata manualmente.", 502);
    }
    if (!res || typeof res !== "object" || !res.minutesText) fail("Falha ao gerar a minuta com IA. Tente novamente ou escreva a ata manualmente.", 502);
    const { actions, ...structured } = res.structuredData || {};
    let minutes;
    const prev = m.latestMinutesId ? await sdb.entities.Minutes.get(m.latestMinutesId).catch(() => null) : null;
    const tplFields = { templateId: tpl?.id || "", templateName: tpl?.name || "" };
    if (prev) {
      minutes = await sdb.entities.Minutes.update(prev.id, { version: prev.version + 1, content: res.minutesText, structuredData: structured, status: "rascunho", generatedBy: "ia", reviewedByUserId: "", approvedByUserId: "", ...tplFields });
      minutes = { ...prev, ...minutes, id: prev.id, version: prev.version + 1, content: res.minutesText, generatedBy: "ia", ...tplFields };
    } else {
      minutes = await sdb.entities.Minutes.create({ meetingId: m.id, version: 1, content: res.minutesText, structuredData: structured, status: "rascunho", generatedBy: "ia", ...tplFields });
    }
    await addVersion(sdb, me, m, minutes, `Minuta gerada por IA a partir da transcrição${tpl ? ` (template: ${tpl.name})` : ""}`, tpl?.name);
    const n = await createActions(sdb, m, minutes.id, actions);
    await sdb.entities.Meeting.update(m.id, { status: "minuta_gerada", latestMinutesId: minutes.id });
    await audit(sdb, me, { entityType: "minutes", entityId: minutes.id, meetingId: m.id, eventType: "minuta_gerada", description: `Minuta v${minutes.version} gerada por IA${tpl ? ` com o template "${tpl.name}"` : ""}; ${n} ação(ões) extraída(s)` });
    return { id: minutes.id };
  });

export const saveMinutesDraft = createServerFn({ method: "POST" }).middleware([requireUser])
  .validator(z.object({ meetingId: id, minutesId: id.optional(), content: z.string().min(1).max(100000), changeSummary: z.string().max(300).optional() }))
  .handler(async ({ context, data }) => {
    const sdb = db(context);
    const me = await loadMe(sdb, context.user);
    const { m, rel } = await getMeetingFor(sdb, me, data.meetingId);
    if (!rel.canEdit) fail("Sem permissão para editar a ata", 403);
    if (["aguardando_aprovacao", "aprovada", "arquivada"].includes(m.status)) fail("A ata está bloqueada para edição neste status");
    let minutes;
    if (!data.minutesId) {
      // Fallback manual (PRD 16.4): ata escrita por humano sem IA.
      minutes = await sdb.entities.Minutes.create({ meetingId: m.id, version: 1, content: data.content, status: "rascunho", generatedBy: "humano" });
      await sdb.entities.Meeting.update(m.id, { latestMinutesId: minutes.id, status: "minuta_gerada" });
    } else {
      const prev = await sdb.entities.Minutes.get(data.minutesId);
      if (prev.meetingId !== m.id) fail("Ata inválida");
      minutes = { ...prev, version: prev.version + 1, content: data.content, generatedBy: prev.generatedBy === "ia" ? "ia_com_edicao_humana" : prev.generatedBy };
      const wasRejected = prev.status === "rejeitada";
      await sdb.entities.Minutes.update(prev.id, { version: minutes.version, content: data.content, generatedBy: minutes.generatedBy, status: wasRejected ? "rascunho" : prev.status });
      if (wasRejected) await sdb.entities.Meeting.update(m.id, { status: "minuta_gerada" });
    }
    await addVersion(sdb, me, m, minutes, data.changeSummary || "Edição manual", minutes.templateName);
    await audit(sdb, me, { entityType: "minutes", entityId: minutes.id, meetingId: m.id, eventType: "ata_editada", description: `Ata salva como versão ${minutes.version}${data.changeSummary ? `: ${data.changeSummary}` : ""}` });
    return { id: minutes.id, version: minutes.version };
  });

export const submitForReview = createServerFn({ method: "POST" }).middleware([requireUser])
  .validator(z.object({ meetingId: id, minutesId: id }))
  .handler(async ({ context, data }) => {
    const sdb = db(context);
    const me = await loadMe(sdb, context.user);
    const { m, rel } = await getMeetingFor(sdb, me, data.meetingId);
    if (!(rel.organizer || me.isAdmin)) fail("Apenas o organizador envia para revisão", 403);
    const mi = await sdb.entities.Minutes.get(data.minutesId);
    if (mi.meetingId !== m.id || !["rascunho", "rejeitada"].includes(mi.status)) fail("A ata precisa estar em rascunho");
    await sdb.entities.Minutes.update(mi.id, { status: "em_revisao", reviewedByUserId: "" });
    await sdb.entities.Meeting.update(m.id, { status: "em_revisao" });
    await audit(sdb, me, { entityType: "minutes", entityId: mi.id, meetingId: m.id, eventType: "enviada_para_revisao", description: `Ata v${mi.version} enviada para revisão de ${m.reviewerUserId}`, old: { status: mi.status }, next: { status: "em_revisao" } });
    await notify(sdb, m.reviewerUserId, `Revisão solicitada: ${m.title}`, `Olá,\n\nA ata da reunião "${m.title}" está aguardando sua revisão no sistema de Atas Auditáveis.\n\nEnviada por ${me.name}.`);
    return { ok: true };
  });

export const completeReview = createServerFn({ method: "POST" }).middleware([requireUser])
  .validator(z.object({ meetingId: id, minutesId: id }))
  .handler(async ({ context, data }) => {
    const sdb = db(context);
    const me = await loadMe(sdb, context.user);
    const { m, rel } = await getMeetingFor(sdb, me, data.meetingId);
    if (!((rel.reviewer && hasRole(me, "reviewer")) || me.isAdmin)) fail("Apenas o revisor designado conclui a revisão", 403);
    const mi = await sdb.entities.Minutes.get(data.minutesId);
    if (mi.meetingId !== m.id || mi.status !== "em_revisao") fail("A ata não está em revisão");
    await sdb.entities.Minutes.update(mi.id, { status: "aguardando_aprovacao", reviewedByUserId: me.email, reviewedAt: new Date().toISOString() });
    await sdb.entities.Meeting.update(m.id, { status: "aguardando_aprovacao" });
    await audit(sdb, me, { entityType: "minutes", entityId: mi.id, meetingId: m.id, eventType: "revisao_concluida", description: `Revisão humana concluída por ${me.name} (v${mi.version})`, old: { status: "em_revisao" }, next: { status: "aguardando_aprovacao" } });
    await notify(sdb, m.approverUserId, `Aprovação solicitada: ${m.title}`, `Olá,\n\nA ata da reunião "${m.title}" foi revisada por ${me.name} e aguarda sua aprovação.`);
    return { ok: true };
  });

async function decide(context, data, decision) {
  const sdb = db(context);
  const me = await loadMe(sdb, context.user);
  const { m, rel } = await getMeetingFor(sdb, me, data.meetingId);
  if (!((rel.approver && hasRole(me, "approver")) || me.isAdmin)) fail("Apenas o aprovador designado pode decidir", 403);
  const mi = await sdb.entities.Minutes.get(data.minutesId);
  if (mi.meetingId !== m.id || mi.status !== "aguardando_aprovacao") fail("A ata precisa estar aguardando aprovação");
  if (!mi.reviewedByUserId) fail("Não é possível decidir sem revisão humana registrada");
  const approved = decision === "aprovado";
  if (!approved && !data.comment?.trim()) fail("O comentário é obrigatório na rejeição");
  const ap = await sdb.entities.Approval.create({ meetingId: m.id, minutesId: mi.id, minutesVersion: mi.version, approverUserId: me.email, approverName: me.name, decision, comment: data.comment, contentHash: await sha256(mi.content) });
  await sdb.entities.Minutes.update(mi.id, { status: approved ? "aprovada" : "rejeitada", approvedByUserId: approved ? me.email : "" });
  await sdb.entities.Meeting.update(m.id, { status: approved ? "aprovada" : "rejeitada" });
  await audit(sdb, me, { entityType: "approval", entityId: ap.id, meetingId: m.id, eventType: approved ? "ata_aprovada" : "ata_rejeitada", description: `Ata v${mi.version} ${approved ? "aprovada" : "rejeitada"} por ${me.name}${data.comment ? `: ${data.comment}` : ""}` });
  if (approved) {
    const parts = await sdb.entities.MeetingParticipant.filter({ meetingId: m.id });
    await notify(sdb, [m.organizerUserId, m.reviewerUserId, ...parts.map((p) => p.email)], `Ata aprovada: ${m.title}`, `A ata da reunião "${m.title}" foi aprovada por ${me.name} e está disponível no repositório.`);
    const acts = await sdb.entities.ActionItem.filter({ meetingId: m.id });
    await Promise.all(acts.filter((a) => a.assignedToUserId).map((a) => notify(sdb, a.assignedToUserId, `Nova ação: ${a.title}`, `Você é responsável pela ação "${a.title}" da reunião "${m.title}".`)));
  } else {
    await notify(sdb, [m.organizerUserId, m.reviewerUserId], `Ata rejeitada: ${m.title}`, `A ata da reunião "${m.title}" foi rejeitada por ${me.name}.\n\nMotivo: ${data.comment}`);
  }
  return { ok: true };
}
const decisionInput = z.object({ meetingId: id, minutesId: id, comment: z.string().max(2000).optional() });
export const approveMinutes = createServerFn({ method: "POST" }).middleware([requireUser]).validator(decisionInput).handler(({ context, data }) => decide(context, data, "aprovado"));
export const rejectMinutes = createServerFn({ method: "POST" }).middleware([requireUser]).validator(decisionInput).handler(({ context, data }) => decide(context, data, "rejeitado"));

export const archiveMeeting = createServerFn({ method: "POST" }).middleware([requireUser])
  .validator(z.object({ meetingId: id }))
  .handler(async ({ context, data }) => {
    const sdb = db(context);
    const me = await loadMe(sdb, context.user);
    if (!me.isAdmin) fail("Apenas administradores arquivam", 403);
    const m = await sdb.entities.Meeting.get(data.meetingId);
    if (m.status !== "aprovada") fail("Somente reuniões aprovadas podem ser arquivadas");
    await sdb.entities.Meeting.update(m.id, { status: "arquivada" });
    await audit(sdb, me, { entityType: "meeting", entityId: m.id, meetingId: m.id, eventType: "reuniao_arquivada", description: "Reunião arquivada", old: { status: "aprovada" }, next: { status: "arquivada" } });
    return { ok: true };
  });

export const extractActions = createServerFn({ method: "POST" }).middleware([requireUser])
  .validator(z.object({ meetingId: id }))
  .handler(async ({ context, data }) => {
    const sdb = db(context);
    const me = await loadMe(sdb, context.user);
    const { m, rel } = await getMeetingFor(sdb, me, data.meetingId);
    if (!rel.canEdit) fail("Sem permissão", 403);
    if (["aprovada", "arquivada"].includes(m.status)) fail("Reunião já aprovada");
    const mi = m.latestMinutesId ? await sdb.entities.Minutes.get(m.latestMinutesId).catch(() => null) : null;
    const t = m.latestTranscriptId ? await sdb.entities.Transcript.get(m.latestTranscriptId).catch(() => null) : null;
    const source = mi?.content || t?.content;
    if (!source) fail("Não há ata ou transcrição para analisar");
    const res = await sdb.integrations.Core.InvokeLLM({
      prompt: `Extraia as ações (compromissos) do texto de uma reunião interna, em ${langName(meetingLanguage(m))}. Escreva os títulos e descrições nesse idioma e não invente responsáveis nem prazos: deixe vazio quando ausentes. dueDate em AAAA-MM-DD apenas se explícito.\n\n${source.slice(0, 60000)}`,
      response_json_schema: ACTIONS_SCHEMA,
    });
    if (!res || !Array.isArray(res.actions)) fail("Não foi possível extrair ações do texto", 502);
    const n = await createActions(sdb, m, mi?.id, res.actions);
    await audit(sdb, me, { entityType: "action_item", entityId: m.id, meetingId: m.id, eventType: "acoes_extraidas", description: `${n} ação(ões) extraída(s) por IA` });
    return { count: n };
  });

export const createAction = createServerFn({ method: "POST" }).middleware([requireUser])
  .validator(z.object({ meetingId: id, title: z.string().min(2).max(300), description: z.string().max(1000).optional(), assignedToName: z.string().max(120).optional(), assignedToUserId: z.string().max(200).optional(), dueDate: z.string().max(40).optional() }))
  .handler(async ({ context, data }) => {
    const sdb = db(context);
    const me = await loadMe(sdb, context.user);
    const { m, rel } = await getMeetingFor(sdb, me, data.meetingId);
    if (!rel.canEdit) fail("Sem permissão", 403);
    const a = await sdb.entities.ActionItem.create({ meetingId: m.id, minutesId: m.latestMinutesId, title: data.title, description: data.description, assignedToName: data.assignedToName, assignedToUserId: data.assignedToUserId?.toLowerCase(), dueDate: isoOrUndefined(data.dueDate), status: "aberta", source: "manual" });
    await audit(sdb, me, { entityType: "action_item", entityId: a.id, meetingId: m.id, eventType: "acao_criada", description: `Ação criada: ${a.title}` });
    if (a.assignedToUserId && ["aprovada", "arquivada"].includes(m.status)) await notify(sdb, a.assignedToUserId, `Nova ação: ${a.title}`, `Você é responsável pela ação "${a.title}" da reunião "${m.title}".`);
    return { id: a.id };
  });

export const updateAction = createServerFn({ method: "POST" }).middleware([requireUser])
  .validator(z.object({ id, status: z.enum(["aberta", "em_andamento", "concluida", "cancelada"]) }))
  .handler(async ({ context, data }) => {
    const sdb = db(context);
    const me = await loadMe(sdb, context.user);
    const a = await sdb.entities.ActionItem.get(data.id).catch(() => null);
    if (!a) fail("Ação não encontrada", 404);
    const m = await sdb.entities.Meeting.get(a.meetingId).catch(() => null);
    const allowed = me.isAdmin || a.assignedToUserId === me.email || m?.organizerUserId === me.email || m?.reviewerUserId === me.email;
    if (!allowed) fail("Sem permissão", 403);
    await sdb.entities.ActionItem.update(a.id, { status: data.status });
    await audit(sdb, me, { entityType: "action_item", entityId: a.id, meetingId: a.meetingId, eventType: "acao_atualizada", description: `Ação "${a.title}": ${a.status} → ${data.status}`, old: { status: a.status }, next: { status: data.status } });
    return { ok: true };
  });

export const listActions = createServerFn({ method: "POST" }).middleware([requireUser])
  .validator(z.object({ status: z.string().max(30).optional(), onlyMine: z.boolean().optional() }))
  .handler(async ({ context, data }) => {
    const sdb = db(context);
    const me = await loadMe(sdb, context.user);
    const priv = me.isAdmin || me.roles.includes("auditor");
    const q = data.status ? { status: data.status } : {};
    let items;
    if (priv && !data.onlyMine) items = (await sdb.entities.ActionItem.filter(q, { sort: "dueDate", limit: 300 })).items;
    else {
      const mine = (await sdb.entities.ActionItem.filter({ ...q, assignedToUserId: me.email }, { limit: 300 })).items;
      const ms = (await sdb.entities.Meeting.filter({ organizerUserId: me.email }, { limit: 300 })).items.map((x) => x.id);
      const org = ms.length && !data.onlyMine ? (await sdb.entities.ActionItem.filter({ ...q, meetingId: { $in: ms } }, { limit: 300 })).items : [];
      items = [...new Map([...mine, ...org].map((a) => [a.id, a])).values()];
    }
    const mids = [...new Set(items.map((a) => a.meetingId))];
    const meetings = mids.length ? (await sdb.entities.Meeting.filter({ id: { $in: mids } }, { limit: 300 })).items : [];
    const title = Object.fromEntries(meetings.map((m) => [m.id, m.title]));
    return items.map((a) => ({ id: a.id, title: a.title, status: a.status, dueDate: a.dueDate, assignedToName: a.assignedToName, assignedToUserId: a.assignedToUserId, source: a.source, meetingId: a.meetingId, meetingTitle: title[a.meetingId] }));
  });