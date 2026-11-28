// Shared by the app UI (server function) and the support agent (server route).
export async function createSupportRequest(base44, user, data) {
  const service = base44.asServiceRole.entities.SupportRequest;
  const record = await service.create({
    subject: data.subject,
    summary: data.summary,
    conversationSummary: data.conversationSummary || "",
    category: data.category || "duvida",
    urgency: data.urgency || "normal",
    status: "aberta",
    requesterUserId: user.id,
    requesterEmail: user.email,
    requesterName: user.full_name || "",
    agentConversationId: data.conversationId || "",
  });
  const protocol = `AT-${String(record.id).replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase()}`;
  await service.update(record.id, { protocol });
  return { protocol, email: user.email, createdAt: record.created_date };
}