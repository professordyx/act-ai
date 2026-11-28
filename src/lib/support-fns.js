import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { createSupportRequest } from "@/lib/support.server";

const schema = z.object({
  subject: z.string().min(3).max(120),
  summary: z.string().min(5).max(2000),
  conversationSummary: z.string().max(6000).optional(),
  category: z.enum(["duvida", "problema_tecnico", "cobranca", "acesso", "sugestao", "outro"]).optional(),
  urgency: z.enum(["baixa", "normal", "alta"]).optional(),
  conversationId: z.string().max(120).optional(),
});

export const escalateSupport = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(schema)
  .handler(({ data, context }) => createSupportRequest(context.getBase44(), context.user, data));