// Checkout embutido do Stripe (ui_mode: "form").
// O servidor guarda a chave secreta e o preço; o cliente escolhe apenas a quantidade de assentos.
import { createFileRoute } from "@tanstack/react-router";
import { secrets } from "base44:runtime";

const STRIPE_API = "https://api.stripe.com/v1";
const STRIPE_VERSION = "2026-03-25.dahlia";
const PRICE_ID = "price_1Ugb9KEHFKmanZlkYMqQW3jK"; // Act AI · US$ 5/mês por assento
const MAX_SEATS = 50;

export const Route = createFileRoute("/api/create-checkout-session")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secretKey = secrets.get("STRIPE_SECRET_KEY");
        const publishableKey = secrets.get("STRIPE_PUBLISHABLE_KEY");
        if (!secretKey) {
          console.log("Stripe checkout: STRIPE_SECRET_KEY ausente");
          return Response.json({ error: "Pagamento não configurado." }, { status: 500 });
        }

        const body = await request.json().catch(() => ({}));
        const seats = Number(body?.seats);
        if (!Number.isInteger(seats) || seats < 1 || seats > MAX_SEATS) {
          return Response.json({ error: "Quantidade de assentos inválida." }, { status: 400 });
        }

        // Origem pública do app (preview e publicado). Nunca derivar de request.url.
        const origin = request.headers.get("Base44-Api-Url");
        if (!origin) {
          console.log("Stripe checkout: cabeçalho Base44-Api-Url ausente");
          return Response.json({ error: "Origem da aplicação indisponível." }, { status: 500 });
        }

        const appId = process.env.BASE44_APP_ID || "";
        const params = new URLSearchParams();
        params.set("ui_mode", "form");
        params.set("mode", "subscription");
        params.set("billing_address_collection", "auto");
        params.set("phone_number_collection[enabled]", "false");
        params.set("automatic_tax[enabled]", "false");
        params.set("payment_method_collection", "always");
        params.set("submit_type", "auto");
        params.set("name_collection[individual][enabled]", "true");
        params.set("name_collection[individual][optional]", "true");
        params.set("name_collection[business][enabled]", "true");
        params.set("name_collection[business][optional]", "true");
        params.set("integration_identifier", "custom_embedded_web_0001");
        params.set("line_items[0][price]", PRICE_ID);
        params.set("line_items[0][quantity]", String(seats));
        params.set("return_url", `${origin}/checkout?status=sucesso`);
        params.set("metadata[base44_app_id]", appId);
        params.set("subscription_data[metadata][base44_app_id]", appId);

        const response = await fetch(`${STRIPE_API}/checkout/sessions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Stripe-Version": STRIPE_VERSION,
            "Content-Type": "application/x-www-form-urlencoded",
            "Idempotency-Key": crypto.randomUUID(),
          },
          body: params.toString(),
        });
        const session = await response.json();
        if (!response.ok) {
          console.log("Stripe checkout error:", session?.error?.message);
          return Response.json(
            { error: session?.error?.message || "Não foi possível iniciar o pagamento." },
            { status: 502 },
          );
        }

        return Response.json({
          client_secret: session.client_secret,
          publishable_key: publishableKey || "",
        });
      },
    },
  },
});