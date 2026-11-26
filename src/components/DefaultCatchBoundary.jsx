import { ErrorComponent, Link, rootRouteId, useMatch, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function DefaultCatchBoundary({ error }) {
  const { t } = useI18n();
  const router = useRouter();
  const isRoot = useMatch({ strict: false, select: (state) => state.id === rootRouteId });

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-24">
      <ErrorComponent error={error} />
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.invalidate()}>
          {t("err.retry")}
        </Button>
        <Button asChild>{isRoot ? <Link to="/">{t("err.home")}</Link> : <Link to="/" onClick={(e) => { e.preventDefault(); window.history.back(); }}>{t("nf.back")}</Link>}</Button>
      </div>
    </div>
  );
}