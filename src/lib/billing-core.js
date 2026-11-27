// Regras comerciais e de acesso do plano. A conta de cobrança é única para a empresa
// (US$ 5 por usuário pago/mês) e a chave de API é central, usada apenas no servidor.

import { audit } from "@/lib/meeting-core";

export const PLAN = {
  pricePerSeatUsd: 5,
  currency: "usd",
  freeMeetingsPerDay: 1,
  freeMaxMinutes: 20,
  timeZone: "America/Sao_Paulo",
  graceDays: 7,
};

export const FREE_DAILY_MESSAGE = "Limite do plano gratuito: 1 reunião por dia. Assine o plano pago para ter reuniões ilimitadas.";
export const FREE_DURATION_MESSAGE = "Limite do plano gratuito: gravações de até 20 minutos. Assine o plano pago para gravações ilimitadas.";

const time = (v) => (v ? new Date(v).getTime() : null);

// Dia local (fuso da empresa) para contar reuniões do plano gratuito.
export const dayKey = (value = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: PLAN.timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));

export async function getAccount(sdb) {
  const page = await sdb.entities.BillingAccount.list({ sort: "-created_date", limit: 1 });
  const [acc] = page.items || [];
  if (acc) return acc;
  return sdb.entities.BillingAccount.create({
    status: "gratuito",
    seats: 0,
    pendingSeats: 0,
    pricePerSeatUsd: PLAN.pricePerSeatUsd,
    currency: PLAN.currency,
    provider: "stripe",
  });
}

export function accountIsActive(acc, now = Date.now()) {
  if (!acc) return false;
  if (acc.status === "ativa") {
    const end = time(acc.currentPeriodEnd);
    return !end || now <= end + PLAN.graceDays * 864e5;
  }
  if (acc.status === "pagamento_pendente" || acc.status === "inadimplente") {
    const end = time(acc.graceUntil) || time(acc.currentPeriodEnd);
    return !!end && now <= end + (acc.status === "inadimplente" ? 0 : PLAN.graceDays * 864e5);
  }
  return false;
}

export async function seatHolders(sdb) {
  const page = await sdb.entities.UserProfile.filter({ hasPaidSeat: true, isActive: true }, { limit: 300 });
  return page.items || [];
}

export async function billingState(sdb, me) {
  const acc = await getAccount(sdb);
  const holders = await seatHolders(sdb);
  const active = accountIsActive(acc);
  const pricePerSeatUsd = acc.pricePerSeatUsd || PLAN.pricePerSeatUsd;
  const purchasedSeats = acc.seats || 0;
  const hasSeat = holders.some((p) => p.email === me.email);
  return { acc, active, hasSeat, isPaid: active && hasSeat, purchasedSeats, seatsUsed: holders.length, pricePerSeatUsd, monthlyTotalUsd: purchasedSeats * pricePerSeatUsd };
}

export async function freeUsageToday(sdb, email) {
  const since = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
  const items = (await sdb.entities.Meeting.filter({ organizerUserId: email, created_date: { $gte: since } }, { limit: 100 })).items;
  const today = dayKey();
  return items.filter((m) => dayKey(m.created_date) === today).length;
}

export async function assertCanStartMeeting(sdb, me) {
  const state = await billingState(sdb, me);
  if (state.isPaid) return state;
  const usedToday = await freeUsageToday(sdb, me.email);
  if (usedToday >= PLAN.freeMeetingsPerDay) throw Object.assign(new Error(FREE_DAILY_MESSAGE), { status: 402 });
  return state;
}

export async function assertRecordingAllowed(sdb, me, durationSeconds) {
  if (!durationSeconds) return;
  const state = await billingState(sdb, me);
  if (state.isPaid) return;
  if (durationSeconds > PLAN.freeMaxMinutes * 60) throw Object.assign(new Error(FREE_DURATION_MESSAGE), { status: 402 });
}

export async function recordBillingEvent(sdb, { type, description, amountUsd, seats, providerRef, byEmail }) {
  await sdb.entities.BillingEvent.create({ type, description, amountUsd, seats, providerRef, performedByEmail: byEmail }).catch(() => null);
}

export async function auditBilling(sdb, me, description, next) {
  await audit(sdb, me, { entityType: "settings", entityId: "billing", eventType: "plano_alterado", description, next });
}