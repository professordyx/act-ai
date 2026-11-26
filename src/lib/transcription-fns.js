import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { audit, db, fail, loadMe } from "@/lib/meeting-core";
import { TRANSCRIPTION_PROVIDERS, isValidModel } from "@/lib/transcription-providers";

async function adminOnly(context) {
  const sdb = db(context);
  const me = await loadMe(sdb, context.user);
  if (!me.isAdmin) fail("Apenas administradores", 403);
  return { sdb, me };
}

const masked = (s) => ({
  configured: true,
  provider: s.provider,
  model: s.model,
  last4: s.apiKeyLast4 || "",
  updatedByEmail: s.updatedByEmail || "",
});

export const getTranscriptionSettings = createServerFn({ method: "POST" }).middleware([requireUser]).handler(async ({ context }) => {
  const { sdb } = await adminOnly(context);
  const page = await sdb.entities.TranscriptionSettings.filter({}, { sort: "-updated_date", limit: 1 });
  const s = page.items[0];
  return { providers: TRANSCRIPTION_PROVIDERS, ...(s?.apiKey ? masked(s) : { configured: false }) };
});

export const saveTranscriptionSettings = createServerFn({ method: "POST" }).middleware([requireUser])
  .validator(
    z.object({
      provider: z.enum(["openai", "google", "assemblyai"]),
      model: z.string().min(1).max(60),
      apiKey: z.string().max(400).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { sdb, me } = await adminOnly(context);
    if (!isValidModel(data.provider, data.model)) fail("Modelo inválido para o provedor selecionado");
    const apiKey = (data.apiKey || "").trim();
    if (apiKey && apiKey.length < 10) fail("Chave inválida");
    const page = await sdb.entities.TranscriptionSettings.filter({}, { limit: 1 });
    const existing = page.items[0];
    if (!apiKey && !existing) fail("Informe a chave de API");
    const body = { provider: data.provider, model: data.model, isActive: true, updatedByEmail: me.email };
    if (apiKey) {
      body.apiKey = apiKey;
      body.apiKeyLast4 = apiKey.slice(-4);
    }
    const saved = existing
      ? await sdb.entities.TranscriptionSettings.update(existing.id, body)
      : await sdb.entities.TranscriptionSettings.create(body);
    await audit(sdb, me, {
      entityType: "settings",
      entityId: saved.id,
      eventType: "transcricao_chave_configurada",
      description: `Chave de transcrição configurada (${data.provider}/${data.model}${apiKey ? `, final ${body.apiKeyLast4}` : ""})`,
      next: { provider: data.provider, model: data.model, last4: saved.apiKeyLast4 },
    });
    return masked(saved);
  });

export const removeTranscriptionSettings = createServerFn({ method: "POST" }).middleware([requireUser]).handler(async ({ context }) => {
  const { sdb, me } = await adminOnly(context);
  const page = await sdb.entities.TranscriptionSettings.filter({}, { limit: 20 });
  await Promise.all(page.items.map((s) => sdb.entities.TranscriptionSettings.delete(s.id)));
  await audit(sdb, me, {
    entityType: "settings",
    entityId: page.items[0]?.id || me.email,
    eventType: "transcricao_chave_removida",
    description: "Chave de transcrição removida",
  });
  return { ok: true };
});