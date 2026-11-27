import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { NotFound } from "@/components/NotFound";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/AuthContext";
import { LanguageProvider } from "@/lib/i18n";
import { Base44Scripts } from "base44:document";
import { APP_ICON_URL } from "@/components/brand/ActAIMark";
import SignupConversion from "@/components/analytics/SignupConversion";
import appCss from "@/index.css?url";

// Google Ads (gtag) — inicializado no escopo do módulo para não perder conversões disparadas
// no primeiro render (ex.: retorno do checkout).
if (typeof document !== "undefined" && !window.__gads_loaded) {
  window.__gads_loaded = true;
  window.dataLayer = window.dataLayer || [];
  const inIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
    if (inIframe) {
      try {
        const args = Array.prototype.slice.call(arguments);
        const cmd = args[0];
        window.parent.postMessage({
          type: "base44_gtag_event",
          event: {
            source: "gtag",
            timestamp: new Date().toLocaleTimeString(),
            command: cmd,
            params: args.slice(1),
            type: cmd === "event" ? args[1] || "event" : cmd,
          },
        }, "*");
      } catch (_e) { /* o relay não pode quebrar o gtag */ }
    }
  };
  const s = document.createElement("script");
  s.src = "https://www.googletagmanager.com/gtag/js?id=AW-18599761113";
  s.async = true;
  document.head.appendChild(s);
  window.gtag("js", new Date());
  window.gtag("config", "AW-18599761113", { send_page_view: false });
}

export const Route = createRootRoute({
  // Per-page <title>/meta come from each route's head(); this is the shared base.
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Atas Auditáveis" },
      { name: "description", content: "Gravar, transcrever, gerar ata, revisar, aprovar e consultar reuniões com trilha de auditoria." },
    ],
    links: [
      { rel: "icon", type: "image/png", href: APP_ICON_URL },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Open+Sans:wght@400;600;700&display=swap" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
  component: RootComponent,
});

function RootComponent() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Outlet />
        <SignupConversion />
        <Toaster />
      </LanguageProvider>
    </AuthProvider>
  );
}

// The document. There is no index.html: the server renders <html> from here.
function RootDocument({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      {/* data-react-root: the builder's preview bridge looks for #root and falls back to this. */}
      <body data-react-root="true">
        {children}
        <Base44Scripts />
        <Scripts />
      </body>
    </html>
  );
}