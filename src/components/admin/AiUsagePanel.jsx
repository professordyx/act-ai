import { useQuery } from "@tanstack/react-query";
import { getAiUsage } from "@/lib/admin-fns";
import { fmt } from "@/lib/labels";
import { ErrorState, Loading } from "@/components/shared/States";
import { useI18n } from "@/lib/i18n";

export default function AiUsagePanel() {
  const { t, locale } = useI18n();
  const { data, isLoading, error } = useQuery({ queryKey: ["ai-usage"], queryFn: () => getAiUsage() });
  const tokens = (n) => Number(n || 0).toLocaleString(locale);
  const usd = (n) => `US$ ${Number(n || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return (
    <section className="card-soft p-5">
      <h2 className="font-heading text-lg font-semibold uppercase">{t("adm.ai.title")}</h2>
      <p className="mt-1 max-w-2xl text-xs text-muted-foreground">{t("adm.ai.description")}</p>
      {isLoading ? <Loading /> : error ? <ErrorState error={error} /> : (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[["adm.ai.calls", tokens(data.calls)], ["adm.ai.tokens", tokens(data.tokens)], ["adm.ai.cost", usd(data.costUsd)]].map(([k, v]) => (
              <div key={k} className="rounded-xl border bg-white p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t(k)}</div>
                <div className="mt-1 font-heading text-2xl font-bold text-secondary">{v}</div>
              </div>
            ))}
          </div>
          {data.calls === 0 ? <p className="text-sm text-muted-foreground">{t("adm.ai.empty")}</p> : (
            <>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("adm.ai.byKind")}</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {data.byKind.map((k) => (
                    <div key={k.kind} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
                      <span className="font-semibold">{t(`ai.kind.${k.kind}`)}</span>
                      <span className="text-xs text-muted-foreground">{k.calls} · {tokens(k.tokens)} tok · {usd(k.costUsd)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("adm.ai.recent")}</div>
                <ul className="divide-y text-sm">
                  {data.recent.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-1.5">
                      <span className="min-w-0 truncate">{t(`ai.kind.${r.kind}`)}{r.meetingTitle ? ` · ${r.meetingTitle}` : ""}</span>
                      <span className="text-xs text-muted-foreground">{fmt(r.created_date, true, locale)} · {tokens(r.tokens)} tok · {usd(r.costUsd)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}