import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { DEFAULT_TEMPLATES } from "@/lib/minutes-templates";
import { db, fail, loadMe } from "@/lib/meeting-core";

const id = z.string().max(60);
const fields = {
  name: z.string().min(2).max(120),
  description: z.string().max(300).optional(),
  prompt: z.string().min(10).max(8000),
};

async function requireAdmin(sdb, user) {
  const me = await loadMe(sdb, user);
  if (!me.isAdmin) fail("Apenas administradores gerenciam templates de ata", 403);
  return me;
}

export const listMinutesTemplates = createServerFn({ method: "POST" }).middleware([requireUser]).handler(async ({ context }) => {
  const sdb = db(context);
  await loadMe(sdb, context.user);
  const r = await sdb.entities.MinutesTemplate.filter({}, { sort: "name", limit: 200 });
  return {
    examples: DEFAULT_TEMPLATES,
    custom: r.items.map((t) => ({ id: t.id, name: t.name, description: t.description, prompt: t.prompt })),
  };
});

export const createMinutesTemplate = createServerFn({ method: "POST" }).middleware([requireUser])
  .validator(z.object(fields))
  .handler(async ({ context, data }) => {
    const sdb = db(context);
    const me = await requireAdmin(sdb, context.user);
    const t = await sdb.entities.MinutesTemplate.create({ name: data.name, description: data.description, prompt: data.prompt, isActive: true, createdByEmail: me.email });
    return { id: t.id };
  });

export const updateMinutesTemplate = createServerFn({ method: "POST" }).middleware([requireUser])
  .validator(z.object({ id, ...fields }))
  .handler(async ({ context, data }) => {
    const sdb = db(context);
    await requireAdmin(sdb, context.user);
    await sdb.entities.MinutesTemplate.update(data.id, { name: data.name, description: data.description, prompt: data.prompt });
    return { ok: true };
  });

export const deleteMinutesTemplate = createServerFn({ method: "POST" }).middleware([requireUser])
  .validator(z.object({ id }))
  .handler(async ({ context, data }) => {
    const sdb = db(context);
    await requireAdmin(sdb, context.user);
    await sdb.entities.MinutesTemplate.delete(data.id);
    return { ok: true };
  });