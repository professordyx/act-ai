import { createServerFn } from "@tanstack/react-start";

export const ping = createServerFn({ method: "POST" }).handler(async () => ({
  counts: { total: 7 },
  metrics: { approvedPct: 50 },
  ok: true,
}));