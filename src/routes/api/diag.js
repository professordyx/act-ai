import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/diag")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const out = { steps: [] };
        try {
          const mod = await import("/src/lib/ping-fns.js?tss-serverfn-split");
          const res = await mod.ping_createServerFn_handler({ request, context: {}, data: {}, method: "POST" });
          if (res instanceof Response) {
            const text = await res.clone().text();
            out.steps.push({ called: "response", status: res.status, contentType: res.headers.get("content-type"), serialized: res.headers.get("x-tss-serialized"), body: text.slice(0, 400) });
          } else {
            out.steps.push({ called: "value", value: JSON.stringify(res)?.slice(0, 400) });
          }
        } catch (error) {
          out.steps.push({ called: "threw", name: error?.name, message: String(error?.message || error), stack: String(error?.stack || "").slice(0, 500) });
        }
        return Response.json(out);
      },
    },
  },
});