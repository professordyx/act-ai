import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { db, fail, loadMe } from "@/lib/meeting-core";
import { PLAN, accountIsActive, auditBilling, billingState, freeUsageToday, getAccount, recordBillingEvent } from "@/lib/billing-core";

async function adminOnly(context) {
  const sdb = db(context);
  const me = await loadMe(sdb, context.user);
  if (!me.isAdmin) fail("Apenas administradores", 403);
  return { sdb, me };
}

const listOf = (res) => (Array.isArray(res) ? res : res?.purchases || res?.items || res?.data || []);
const isPaidPurchase = (p) => ["paid", "succeeded", "active"].includes(String(p?.status || "").toLowerCase());
const subIdOf = (p) => p?.subscription_id || p?.subscriptionId || undefined;

// Visão da assinatura: qualquer usuário vê o plano da empresa; administrador vê assentos, histórico e custo de API.
export const getBilling = createServerFn({ method: "POST" }).middleware([requireUser]).handler(async ({ context }) => {
  const sdb = db(context);
  const me = await loadMe(sdb, context.user);
  const state = await billingState(sdb, me);
  const base = {
    email: me.email,
    isAdmin: me.isAdmin,
    isPaid: state.isPaid,
    active: state.active,
    hasSeat: state.hasSeat,
    status: state.acc.status === "ativa" && !state.active ? "cancelada" : state.acc.status,
    seats: state.purchasedSeats,
    pendingSeats: state.acc.pendingSeats || 0,
    seatsUsed: state.seatsUsed,
    pricePerSeatUsd: state.pricePerSeatUsd,
    monthlyTotalUsd: state.monthlyTotalUsd,
    currentPeriodEnd: state.acc.currentPeriodEnd || null,
    cancelAtPeriodEnd: !!state.acc.cancelAtPeriodEnd,
    freeMeetingsPerDay: PLAN.freeMeetingsPerDay,
    freeMaxMinutes: PLAN.freeMaxMinutes,
    usedToday: state.isPaid ? 0 : await freeUsageToday(sdb, me.email),
    events: [],
    profiles: [],
    apiCostUsd: null,
  };
  if (!me.isAdmin) return base;
  const [events, profiles, usage] = await Promise.all([
    sdb.entities.BillingEvent.list({ sort: "-created_date", limit: 20 }),
    sdb.entities.UserProfile.filter({ isActive: true }, { sort: "fullName", limit: 300 }),
    sdb.entities.AiUsage.list({ sort: "-created_date", limit: 500 }),
  ]);
  return {
    ...base,
    events: (events.items || []).map((e) => ({ id: e.id, type: e.type, description: e.description, amountUsd: e.amountUsd, seats: e.seats, created_date: e.created_date })),
    profiles: (profiles.items || []).map((p) => ({ email: p.email, name: p.fullName, hasPaidSeat: !!p.hasPaidSeat })),
    apiCostUsd: (usage.items || []).reduce((a, r) => a + (r.costUsd || 0), 0),
  };
});

// Checkout recorrente da conta da empresa: US$ 5 por assento, quantidade escolhida pelo administrador.
export const startSeatCheckout = createServerFn({ method: "POST" }).middleware([requireUser])
  .validator(z.object({ seats: z.number().int().min(1).max(500) }))
  .handler(async ({ context, data }) => {
    const { sdb, me } = await adminOnly(context);
    const acc = await getAccount(sdb);
    if (accountIsActive(acc)) fail("Já existe uma assinatura ativa. Cancele ao fim do período para contratar outra quantidade.");
    const price = acc.pricePerSeatUsd || PLAN.pricePerSeatUsd;
    const checkout = await sdb.payments.createCheckout({
      items: [{ name: `Act AI · ${data.seats} assento(s) mensais`, amount: Math.round(price * 100), quantity: data.seats, recurring: { frequency: "month" } }],
      currency: PLAN.currency,
      success_path: "/billing",
      cancel_path: "/billing",
      buyer: { email: me.email },
      metadata: { seats: String(data.seats) },
    });
    const url = checkout?.redirect_url || checkout?.url;
    if (!url) fail("O provedor de pagamentos não retornou o endereço do checkout.", 502);
    await sdb.entities.BillingAccount.update(acc.id, { status: "pagamento_pendente", pendingSeats: data.seats, lastCheckoutId: checkout.checkout_id || checkout.id, updatedByEmail: me.email });
    await recordBillingEvent(sdb, { type: "checkout_iniciado", description: `Checkout aberto para ${data.seats} assento(s)`, amountUsd: data.seats * price, seats: data.seats, providerRef: checkout.checkout_id, byEmail: me.email });
    await auditBilling(sdb, me, `Checkout de ${data.seats} assento(s) iniciado`, { seats: data.seats });
    return { url };
  });

// Confirmação no servidor: só ativa a assinatura depois de o provedor confirmar o pagamento.
export const confirmCheckout = createServerFn({ method: "POST" }).middleware([requireUser]).handler(async ({ context }) => {
  const { sdb, me } = await adminOnly(context);
  const acc = await getAccount(sdb);
  let purchases = [];
  try {
    purchases = listOf(await sdb.payments.listPurchases({ buyer_email: me.email, limit: 20 }));
  } catch (err) {
    fail(`Não foi possível consultar o pagamento: ${err?.message || err}`, 502);
  }
  // O comprador pode ter informado outro e-mail no checkout: confirma pelo checkout que criamos.
  if (!purchases.length && acc.lastCheckoutId) {
    purchases = listOf(await sdb.payments.listPurchases({ checkout_id: acc.lastCheckoutId }).catch(() => []));
  }
  const paid = purchases.filter(isPaidPurchase);
  if (!paid.length) return { ok: false };
  const latest = paid[0];
  const seats = acc.pendingSeats || acc.seats || 1;
  const price = acc.pricePerSeatUsd || PLAN.pricePerSeatUsd;
  const periodEnd = latest.current_period_end || latest.currentPeriodEnd || latest.period_end || new Date(Date.now() + 30 * 864e5).toISOString();
  await sdb.entities.BillingAccount.update(acc.id, {
    status: "ativa",
    seats,
    pendingSeats: 0,
    providerSubscriptionId: subIdOf(latest) || acc.providerSubscriptionId,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: false,
    lastPaymentAt: new Date().toISOString(),
    updatedByEmail: me.email,
  });
  await recordBillingEvent(sdb, { type: "assinatura_ativa", description: `Assinatura confirmada: ${seats} assento(s)`, amountUsd: seats * price, seats, providerRef: subIdOf(latest), byEmail: me.email });
  await auditBilling(sdb, me, `Assinatura ativada com ${seats} assento(s)`, { seats, periodEnd });
  return { ok: true, seats };
});

// Assentos: o administrador escolhe quais usuários ocupam os assentos pagos.
export const setPaidSeat = createServerFn({ method: "POST" }).middleware([requireUser])
  .validator(z.object({ email: z.string().email().max(200), hasSeat: z.boolean() }))
  .handler(async ({ context, data }) => {
    const { sdb, me } = await adminOnly(context);
    const state = await billingState(sdb, me);
    const email = data.email.toLowerCase();
    const [p] = await sdb.entities.UserProfile.filter({ email });
    if (!p) fail("Perfil não encontrado", 404);
    if (!!p.hasPaidSeat === data.hasSeat) return { ok: true };
    if (data.hasSeat && state.seatsUsed >= state.purchasedSeats) fail(`Todos os ${state.purchasedSeats} assento(s) contratado(s) já estão em uso.`);
    await sdb.entities.UserProfile.update(p.id, { hasPaidSeat: data.hasSeat, seatAssignedAt: data.hasSeat ? new Date().toISOString() : undefined });
    await recordBillingEvent(sdb, { type: "assentos_alterados", description: `${email} ${data.hasSeat ? "passou a ocupar" : "liberou"} um assento pago`, seats: state.seatsUsed + (data.hasSeat ? 1 : -1), byEmail: me.email });
    await auditBilling(sdb, me, `${email} ${data.hasSeat ? "passou a ocupar" : "liberou"} um assento pago`);
    return { ok: true };
  });

// Cancelamento: mantém o acesso pago até o fim do período já faturado.
export const cancelPlan = createServerFn({ method: "POST" }).middleware([requireUser]).handler(async ({ context }) => {
  const { sdb, me } = await adminOnly(context);
  const acc = await getAccount(sdb);
  if (acc.providerSubscriptionId) {
    try {
      await sdb.payments.cancelSubscription(acc.providerSubscriptionId, { at_period_end: true });
    } catch (err) {
      fail(`Não foi possível cancelar no provedor: ${err?.message || err}`, 502);
    }
    await sdb.entities.BillingAccount.update(acc.id, { cancelAtPeriodEnd: true, updatedByEmail: me.email });
  } else {
    await sdb.entities.BillingAccount.update(acc.id, { status: "cancelada", cancelAtPeriodEnd: false, updatedByEmail: me.email });
  }
  await recordBillingEvent(sdb, { type: "assinatura_cancelada", description: "Cancelamento solicitado pelo administrador", seats: acc.seats, byEmail: me.email });
  await auditBilling(sdb, me, "Assinatura cancelada ao fim do período", { cancelAtPeriodEnd: true });
  return { ok: true };
});