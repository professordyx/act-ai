import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { requireUserRoute } from "@/lib/auth-middleware";
import { createSupportRequest } from "@/lib/support.server";

// Tool endpoint for the support agent: registers a human-handoff request with context.
const schema = z.object({
  subject: z.string().min(3).max(120),
  summary: z.string().min(5).max(2000),
  conversationSummary: z.string().max(6000).optional(),
  category: z.enum(["duvida", "problema_tecnico", "cobranca", "acesso", "sugestao", "outro"]).optional(),
  urgency: z.enum(["baixa", "normal", "alta"]).optional(),
  conversationId: z.string().max(120).optional(),
});

export const Route = createFileRoute("/api/support/escalate")({
  server: {
    middleware: [requireUserRoute],
    handlers: {
      POST: async ({ request, context }) => {
        let data;
        try {
          data = schema.parse(await request.json());
        } catch (error) {
          console.log("[support/escalate] invalid payload", error?.message);
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }
        try {
          const result = await createSupportRequest(context.getBase44(), context.user, data);
          return Response.json(result);
        } catch (error) {
          console.log("[support/escalate] failed", error?.message);
          return Response.json({ error: "Could not register the request" }, { status: 500 });
        }
      },
    },
  },
});