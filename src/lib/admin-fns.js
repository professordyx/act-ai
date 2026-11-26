import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { ALL_ROLES, MOCK_TRANSCRIPT, audit, db, fail, loadMe } from "@/lib/meeting-core";

async function adminOnly(context) {
  const sdb = db(context);
  const me = await loadMe(sdb, context.user);
  if (!me.isAdmin) fail("Apenas administradores", 403);
  return { sdb, me };
}

export const adminListProfiles = createServerFn({ method: "POST" }).middleware([requireUser]).handler(async ({ context }) => {
  const { sdb } = await adminOnly(context);
  return (await sdb.entities.UserProfile.filter({}, { sort: "fullName", limit: 300 })).items;
});

export const upsertProfile = createServerFn({ method: "POST" }).middleware([requireUser])
  .validator(z.object({ email: z.string().email().max(200), fullName: z.string().max(120).optional(), roles: z.array(z.enum(ALL_ROLES)).max(6), isActive: z.boolean() }))
  .handler(async ({ context, data }) => {
    const { sdb, me } = await adminOnly(context);
    const email = data.email.toLowerCase();
    const [p] = await sdb.entities.UserProfile.filter({ email });
    const body = { email, fullName: data.fullName || p?.fullName || email, roles: data.roles, isActive: data.isActive };
    const saved = p ? await sdb.entities.UserProfile.update(p.id, body) : await sdb.entities.UserProfile.create(body);
    await audit(sdb, me, { entityType: "user", entityId: saved.id || p?.id, eventType: "perfil_alterado", description: `Perfil de ${email}: ${data.roles.join(", ") || "sem papéis"}${data.isActive ? "" : " (inativo)"}`, old: p ? { roles: p.roles, isActive: p.isActive } : undefined, next: { roles: data.roles, isActive: data.isActive } });
    return { ok: true };
  });

// Dados de demonstração: reunião interna de equipe já transcrita (modo demonstração).
export const seedDemo = createServerFn({ method: "POST" }).middleware([requireUser]).handler(async ({ context }) => {
  const { sdb, me } = await adminOnly(context);
  const names = ["Ana Souza", "Carlos Lima", "Marina Rocha"];
  const m = await sdb.entities.Meeting.create({
    title: "Alinhamento interno: padronização de propostas comerciais",
    description: "Reunião de equipe interna (demonstração).",
    scheduledAt: new Date().toISOString(),
    locationType: "hibrida",
    locationDetails: "Sala 2 / Meet",
    organizerUserId: me.email,
    reviewerUserId: me.email,
    approverUserId: me.email,
    consentRequired: true,
    consentCaptured: true,
    status: "transcrito",
  });
  await sdb.entities.MeetingParticipant.bulkCreate([{ meetingId: m.id, name: me.name, email: me.email, roleInMeeting: "organizador" }, ...names.map((n) => ({ meetingId: m.id, name: n, roleInMeeting: "participante" }))]);
  const t = await sdb.entities.Transcript.create({ meetingId: m.id, language: "pt-BR", content: MOCK_TRANSCRIPT(m.title, names.map((n) => n.split(" ")[0])), status: "concluida", source: "mock", createdByUserId: me.email });
  await sdb.entities.Meeting.update(m.id, { latestTranscriptId: t.id });
  await audit(sdb, me, { entityType: "meeting", entityId: m.id, meetingId: m.id, eventType: "reuniao_demo_criada", description: "Reunião de demonstração criada" });
  return { id: m.id };
});