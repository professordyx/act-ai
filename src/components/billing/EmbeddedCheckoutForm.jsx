import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

const STRIPE_JS = "https://js.stripe.com/dahlia/stripe.js";

// Aparência configurada no Checkout Studio.
const appearance = {
  theme: "flat",
  labels: "auto",
  inputs: "spaced",
  variables: {
    borderRadius: "4px",
    colorBackground: "#ffffff",
    colorDanger: "#df1b41",
    colorPrimary: "#3A6B58",
    colorSuccess: "#077d38",
    colorText: "#213A48",
    fontFamily: "default",
    fontSizeBase: "16px",
    spacingUnit: "4px",
  },
};

function loadStripeJs() {
  if (window.Stripe) return Promise.resolve(window.Stripe);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = STRIPE_JS;
    script.async = true;
    script.onload = () => (window.Stripe ? resolve(window.Stripe) : reject(new Error("Stripe indisponível.")));
    script.onerror = () => reject(new Error("Não foi possível carregar o Stripe."));
    document.head.appendChild(script);
  });
}

export default function EmbeddedCheckoutForm({ seats, errorText }) {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setReady(false);
    setError("");

    (async () => {
      try {
        const [Stripe, response] = await Promise.all([
          loadStripeJs(),
          fetch("/api/create-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ seats }),
          }),
        ]);
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || errorText);

        const stripe = Stripe(data.publishable_key);
        const checkout = stripe.initCheckoutFormSdk({ clientSecret: data.client_secret, appearance });
        const form = checkout.createForm({ layout: "expanded" });
        if (containerRef.current) form.mount(containerRef.current);

        const actions = await checkout.loadActions();
        if (actions.type !== "success") throw new Error(errorText);
        form.on("confirm", async (event) => {
          try {
            await actions.actions.confirm({ formConfirmEvent: event });
          } catch (err) {
            setError(err?.message || errorText);
          }
        });
        if (active) setReady(true);
      } catch (err) {
        if (active) setError(err?.message || errorText);
      }
    })();

    return () => {
      active = false;
    };
  }, [seats, errorText]);

  return (
    <div className="w-full">
      {!ready && !error && (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      {error && <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      <div id="checkout-form" ref={containerRef} />
    </div>
  );
}