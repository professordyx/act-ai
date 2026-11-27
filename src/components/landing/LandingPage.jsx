import { useAuth } from "@/lib/AuthContext";
import { useI18n } from "@/lib/i18n";
import { LANDING_COPY } from "@/lib/landing-copy";
import Hero from "@/components/landing/Hero";
import ProblemSection from "@/components/landing/ProblemSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import ControlSection from "@/components/landing/ControlSection";
import ClosingCta from "@/components/landing/ClosingCta";

export default function LandingPage() {
  const { lang } = useI18n();
  const { isAuthenticated } = useAuth();
  const copy = LANDING_COPY[lang] || LANDING_COPY.pt;
  const to = isAuthenticated ? "/dashboard" : "/login";
  const search = isAuthenticated ? undefined : { returnTo: "/dashboard" };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f6efe2] font-body text-[#17303d]">
      <Hero copy={copy.hero} brand={copy.brand} />
      <ProblemSection copy={copy.problem} transcription={copy.transcription} />
      <BenefitsSection copy={copy.benefits} />
      <ControlSection control={copy.control} languages={copy.languages} />
      <ClosingCta copy={copy.closing} to={to} search={search} />
    </div>
  );
}