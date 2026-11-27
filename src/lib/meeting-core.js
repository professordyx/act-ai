// Helpers de servidor: perfis (RBAC), auditoria, notificações, permissões e prompts.
// Só é usado dentro de handlers de server functions. Todas as entidades são admin-only por RLS;
// o acesso real passa por estas funções (service role).

import { createClientFromRequest } from "@base44/sdk";
import { getRequest } from "@tanstack/react-start/server";

export const ALL_ROLES = ["admin", "organizer", "reviewer", "approver", "participant", "auditor"];

// Idioma da reunião: define o idioma da transcrição e da ata gerada.
export const MEETING_LANGUAGES = ["pt", "en", "es"];
export const LANG_LOCALES = { pt: "pt-BR", en: "en-US", es: "es-ES" };
const LANG_NAMES = { pt: "português do Brasil", en: "inglês", es: "espanhol" };
export const meetingLanguage = (m) => (MEETING_LANGUAGES.includes(m?.language) ? m.language : "pt");
export const langName = (code) => LANG_NAMES[code] || LANG_NAMES.pt;
// Cliente de serviço: usa o contexto quando ele traz getBase44 e, se não, cria o cliente
// a partir do próprio request (o mesmo que o middleware faria).
const visitorClient = (ctx) =>
  typeof ctx?.getBase44 === "function" ? ctx.getBase44() : createClientFromRequest(getRequest());

export const db = (ctx) => visitorClient(ctx).asServiceRole;
export const fail = (message, status = 400) => {
  throw Object.assign(new Error(message), { status });
};

// HIPÓTESE MVP: papéis lógicos vivem em UserProfile; admin da plataforma tem todos os papéis.
export async function loadMe(sdb, user) {
  const email = user.email.toLowerCase();
  let [p] = await sdb.entities.UserProfile.filter({ email });
  if (!p) {
    p = await sdb.entities.UserProfile.create({
      userId: user.id,
      fullName: user.full_name || email,
      email,
      roles: user.role === "admin" ? ["admin"] : ["organizer", "participant"],
      isActive: true,
    });
  }
  if (p.isActive === false) fail("Usuário inativo", 403);
  const platformAdmin = user.role === "admin";
  const roles = platformAdmin ? ALL_ROLES : p.roles || [];
  return { id: user.id, email, name: p.fullName || user.full_name || email, roles, isAdmin: platformAdmin || roles.includes("admin") };
}

export const hasRole = (me, r) => me.isAdmin || me.roles.includes(r);

const clientIp = () => {
  try { return getRequest().headers.get("cf-connecting-ip") || ""; } catch { return ""; }
};

export async function audit(sdb, me, e) {
  const ip = clientIp();
  return sdb.entities.AuditLog.create({
    entityType: e.entityType,
    entityId: String(e.entityId),
    meetingId: e.meetingId,
    eventType: e.eventType,
    eventDescription: e.description,
    oldValueJson: e.old ? JSON.stringify(e.old).slice(0, 4000) : undefined,
    newValueJson: e.next ? JSON.stringify(e.next).slice(0, 4000) : undefined,
    performedByUserId: me.email,
    performedByName: me.name,
    ipAddress: ip,
  });
}

// Melhor esforço: SendEmail só alcança usuários cadastrados no app; falhas não interrompem o fluxo.
export async function notify(sdb, to, subject, body) {
  const list = [...new Set([].concat(to).filter(Boolean))];
  await Promise.all(
    list.map((t) =>
      sdb.integrations.Core.SendEmail({ to: t, subject, body, category: "transactional" }).catch((err) =>
        console.error("notify falhou", t, err?.message),
      ),
    ),
  );
}

export async function getMeetingFor(sdb, me, id) {
  const m = await sdb.entities.Meeting.get(id).catch(() => null);
  if (!m) fail("Reunião não encontrada", 404);
  const rel = {
    organizer: m.organizerUserId === me.email,
    reviewer: m.reviewerUserId === me.email,
    approver: m.approverUserId === me.email,
  };
  rel.full = me.isAdmin || me.roles.includes("auditor") || rel.organizer || rel.reviewer || rel.approver;
  rel.canEdit = me.isAdmin || rel.organizer || rel.reviewer;
  if (!rel.full) {
    const [p] = await sdb.entities.MeetingParticipant.filter({ meetingId: id, email: me.email });
    if (!p || !["aprovada", "arquivada"].includes(m.status)) fail("Sem permissão para esta reunião", 403);
  }
  return { m, rel };
}

export const isoOrUndefined = (s) => {
  if (!s || !/^\d{4}-\d{2}-\d{2}/.test(String(s))) return undefined;
  const d = new Date(s);
  return isNaN(d) ? undefined : d.toISOString();
};

export async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const ACTION_ITEMS = {
  type: "array",
  items: {
    type: "object",
    properties: {
      title: { type: "string" },
      description: { type: "string" },
      assignedToName: { type: "string" },
      dueDate: { type: "string" },
      confidence: { type: "string" },
    },
  },
};

export const MINUTES_SCHEMA = {
  type: "object",
  properties: {
    minutesText: { type: "string" },
    structuredData: {
      type: "object",
      properties: {
        summary: { type: "string" },
        topics: { type: "array", items: { type: "string" } },
        decisions: { type: "array", items: { type: "string" } },
        risks: { type: "array", items: { type: "string" } },
        actions: ACTION_ITEMS,
      },
    },
  },
  required: ["minutesText", "structuredData"],
};

export const ACTIONS_SCHEMA = { type: "object", properties: { actions: ACTION_ITEMS }, required: ["actions"] };

export function minutesPrompt(meeting, participants, transcript, template) {
  const idioma = langName(meetingLanguage(meeting));
  const format = template?.prompt?.trim()
    ? `\n\nFORMATO OBRIGATÓRIO DA ATA (template "${template.name}"):\nSubstitua a estrutura sugerida na regra 3 pela estrutura, seções e tom descritos abaixo. Mantenha as demais regras (não inventar fatos, marcar "A VALIDAR", prazos e formato de retorno). O idioma de saída definido acima prevalece sobre qualquer idioma indicado no template.\n---\n${template.prompt.trim().slice(0, 6000)}\n---`
    : "";
  return `Você é um assistente especializado em redação de atas corporativas auditáveis.
Gere uma minuta de ata de reunião interna, em ${idioma}, com base EXCLUSIVAMENTE na transcrição fornecida.

IDIOMA DE SAÍDA: ${idioma}. Escreva em ${idioma} TODO o conteúdo retornado (minutesText, summary, topics, decisions, risks e actions), mesmo que a transcrição esteja em outro idioma. Preserve nomes próprios, siglas e citações exatamente como no original. "A VALIDAR" é um rótulo do sistema: mantenha-o escrito exatamente assim em qualquer idioma.

Regras:
1. Não invente fatos, nomes, decisões ou prazos.
2. Quando houver ambiguidade ou baixa clareza, marque com "A VALIDAR".
3. Estruture de forma clara e corporativa, com seções: Objetivo, Participantes, Tópicos discutidos, Decisões, Ações (responsável e prazo), Riscos e pendências.
4. Se não houver informação suficiente para um campo, use "A VALIDAR" ou deixe vazio.
5. Prazos em actions.dueDate no formato AAAA-MM-DD somente se explícitos; senão deixe vazio.
6. Retorne minutesText (texto completo da ata) e structuredData (summary, topics, decisions, risks, actions com confidence alta|media|baixa).

${format}

Reunião: ${meeting.title}
Data: ${meeting.scheduledAt}
Local: ${meeting.locationType || ""} ${meeting.locationDetails || ""}
Participantes cadastrados: ${participants.map((p) => p.name).join(", ") || "não informado"}

TRANSCRIÇÃO:
${transcript.slice(0, 60000)}`;
}

export const MOCK_TRANSCRIPT = (title, names) =>
  `[TRANSCRIÇÃO DE DEMONSTRAÇÃO] Reunião: ${title}.
${names[0] || "Ana"}: Bom dia a todos. O objetivo hoje é alinhar o andamento do projeto de implantação do novo processo de atendimento aos clientes e definir os próximos passos.
${names[1] || "Carlos"}: Concluímos o mapeamento dos processos atuais. Identificamos três gargalos principais, principalmente no retorno aos clientes.
${names[0] || "Ana"}: Decidimos então priorizar a padronização do modelo de proposta comercial. Carlos, você fica responsável por entregar o modelo até o dia 15 do próximo mês.
${names[2] || "Marina"}: Eu posso revisar a documentação de qualidade, mas preciso de acesso aos registros antigos. Não sei ainda o prazo exato.
${names[0] || "Ana"}: Como risco, anotei que a equipe está sobrecarregada em dezembro. Vamos reavaliar na próxima reunião.
${names[1] || "Carlos"}: Combinado. Também precisamos agendar o treinamento interno da equipe, mas a data ainda não foi definida.
${names[0] || "Ana"}: Perfeito. Encerramos por aqui, obrigada.`;