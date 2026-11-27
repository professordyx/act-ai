import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, MailX, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import ActAILogo from "@/components/brand/ActAILogo";
import { useI18n } from "@/lib/i18n";

const COPY = {
  pt: {
    checking: "Processando seu descadastro...",
    doneTitle: "Descadastro confirmado",
    doneText: "Você não receberá mais e-mails de marketing deste aplicativo. E-mails transacionais, como recibos e redefinição de senha, continuam sendo enviados normalmente.",
    invalidTitle: "Link inválido ou expirado",
    invalidText: "Este link de descadastro não é válido. Use o link do último e-mail recebido ou fale com o administrador da conta.",
    errorTitle: "Não foi possível concluir agora",
    errorText: "Tivemos um problema ao processar seu pedido. Tente novamente em alguns instantes.",
    retry: "Tentar novamente",
    home: "Ir para o Act AI",
    preview: "Prévia",
  },
  en: {
    checking: "Processing your unsubscribe request...",
    doneTitle: "Unsubscribe confirmed",
    doneText: "You will no longer receive marketing emails from this app. Transactional emails, such as receipts and password resets, will still be sent.",
    invalidTitle: "Invalid or expired link",
    invalidText: "This unsubscribe link is not valid. Use the link in the last email you received or contact the account administrator.",
    errorTitle: "Could not complete right now",
    errorText: "Something went wrong while processing your request. Please try again in a moment.",
    retry: "Try again",
    home: "Go to Act AI",
    preview: "Preview",
  },
  es: {
    checking: "Procesando su baja...",
    doneTitle: "Baja confirmada",
    doneText: "Ya no recibirá correos de marketing de esta aplicación. Los correos transaccionales, como recibos y restablecimiento de contraseña, se seguirán enviando.",
    invalidTitle: "Enlace inválido o expirado",
    invalidText: "Este enlace de baja no es válido. Use el enlace del último correo recibido o contacte al administrador de la cuenta.",
    errorTitle: "No fue posible completar ahora",
    errorText: "Hubo un problema al procesar su solicitud. Inténtelo de nuevo en unos instantes.",
    retry: "Intentar de nuevo",
    home: "Ir a Act AI",
    preview: "Vista previa",
  },
};

const inPreview = () =>
  typeof window !== "undefined" && (window.self !== window.top || /^preview(-sandbox)?--/.test(window.location.hostname));

export const Route = createFileRoute("/unsubscribe")({
  head: () => ({
    meta: [
      { title: "Descadastrar e-mails · Atas Auditáveis" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const { lang } = useI18n();
  const c = COPY[lang] || COPY.pt;
  const [state, setState] = useState("checking");
  const [preview, setPreview] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    if (!token) {
      const framed = inPreview();
      setPreview(framed);
      setState(framed ? "done" : "invalid");
      return;
    }
    let alive = true;
    setState("checking");
    (async () => {
      try {
        const res = await fetch("/api/app-emails/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!alive) return;
        if (res.ok) setState("done");
        else if (res.status === 400) setState("invalid");
        else setState("error");
      } catch {
        if (alive) setState("error");
      }
    })();
    return () => {
      alive = false;
    };
  }, [attempt]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--brand-surface)]">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <ActAILogo markClass="h-8 w-auto" textClass="text-2xl" />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
        <section className="card-soft w-full max-w-lg p-6 text-center sm:p-9">
          {state === "checking" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{c.checking}</p>
            </div>
          )}

          {state === "done" && (
            <div className="flex flex-col items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-7 w-7 text-primary" />
              </span>
              <h1 className="h-display text-2xl sm:text-3xl">{c.doneTitle}</h1>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{c.doneText}</p>
              {preview && (
                <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {c.preview}
                </span>
              )}
            </div>
          )}

          {state === "invalid" && (
            <div className="flex flex-col items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                <MailX className="h-7 w-7 text-amber-700" />
              </span>
              <h1 className="h-display text-2xl sm:text-3xl">{c.invalidTitle}</h1>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{c.invalidText}</p>
            </div>
          )}

          {state === "error" && (
            <div className="flex flex-col items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
                <TriangleAlert className="h-7 w-7 text-rose-700" />
              </span>
              <h1 className="h-display text-2xl sm:text-3xl">{c.errorTitle}</h1>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{c.errorText}</p>
              <Button className="mt-1 rounded-full font-bold" onClick={() => setAttempt((n) => n + 1)}>
                {c.retry}
              </Button>
            </div>
          )}

          {state !== "checking" && (
            <div className="mt-7 border-t pt-4">
              <Link to="/" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
                {c.home}
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}