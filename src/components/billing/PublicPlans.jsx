import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import ActAILogo from "@/components/brand/ActAILogo";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import PlanCards from "@/components/billing/PlanCards";
import { useBillingCopy } from "@/lib/billing-i18n";
import { useI18n } from "@/lib/i18n";

export default function PublicPlans() {
  const c = useBillingCopy();
  const { t } = useI18n();
  const benefits = [c.benefit1, c.benefit2, c.benefit3];
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/"><ActAILogo markClass="h-8 w-auto" textClass="text-2xl" /></Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button asChild variant="outline" className="hidden rounded-full sm:inline-flex"><Link to="/login">{c.ctaSignin}</Link></Button>
            <Button asChild className="rounded-full font-bold"><Link to="/register">{c.ctaRegister}</Link></Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="eyebrow">{c.heroEyebrow}</p>
        <h1 className="mt-2 max-w-3xl font-heading text-4xl font-bold uppercase sm:text-5xl">{c.heroTitle}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{c.heroText}</p>
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-xl font-bold uppercase">{c.benefitsTitle}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {benefits.map((b) => <li key={b} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{b}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold uppercase">{c.useTitle}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{c.useText}</p>
          </div>
        </div>
        <div className="mt-12">
          <h2 className="font-heading text-2xl font-bold uppercase">{c.policyTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{c.policyNote}</p>
          <div className="mt-5"><PlanCards pricePerSeatUsd={5} /></div>
          <p className="mt-3 text-xs text-muted-foreground">{c.example}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="rounded-full font-bold"><Link to="/register">{c.ctaRegister}<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            <Button asChild variant="outline" className="rounded-full"><Link to="/login">{c.ctaSignin}</Link></Button>
          </div>
        </div>
      </main>
      <footer className="border-t py-8 text-center text-xs text-muted-foreground">{t("app.subtitle")}</footer>
    </div>
  );
}