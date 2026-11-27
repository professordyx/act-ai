// Checkout no navegador: a pré-visualização roda em iframe, então o Stripe precisa de uma
// aba aberta de forma síncrona no clique. Fora do iframe, a própria página navega.
export async function openCheckout(create) {
  const framed = typeof window !== "undefined" && window.self !== window.top;
  const tab = framed ? window.open("", "_blank") : null;
  if (framed && !tab) throw new Error("Permita pop-ups para continuar o pagamento.");
  if (tab) tab.opener = null;
  try {
    const { url } = await create();
    if (!url) throw new Error("Checkout indisponível");
    if (tab) tab.location.replace(url);
    else window.location.assign(url);
  } catch (err) {
    tab?.close();
    throw err;
  }
}