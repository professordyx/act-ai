import { LANGS, useI18n } from "@/lib/i18n";
import { LANDING_IMAGES } from "@/lib/landing-copy";
import { Image } from "@/components/ui/image";
import { useAuth } from "@/lib/AuthContext";
import { CtaPair } from "@/components/landing/parts";

export default function Hero({ copy, brand }) {
  const { lang, setLang } = useI18n();
  const { isAuthenticated } = useAuth();
  const to = isAuthenticated ? "/dashboard" : "/login";
  const search = isAuthenticated ? undefined : { returnTo: "/dashboard" };
  const heroCopy = { ...copy, primary: isAuthenticated ? copy.primaryAuthed : copy.primary };

  return (
    <header className="relative flex min-h-[680px] flex-col justify-between gap-16 overflow-hidden px-6 pb-20 pt-8 md:min-h-[820px] md:gap-24 md:px-16 md:pb-24 md:pt-9">
      <Image
        src={LANDING_IMAGES.hero}
        alt={copy.imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
        fittingType="fill"
      />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(14,38,32,0.92)_0%,rgba(18,48,56,0.78)_52%,rgba(18,48,56,0.35)_100%)]" />

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div className="font-heading text-[22px] font-bold uppercase tracking-[0.04em] text-white">{brand}</div>
        <div className="flex flex-wrap gap-2">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              aria-pressed={lang === l.code}
              className={`cursor-pointer rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-white focus-visible:outline-offset-[3px] ${
                lang === l.code
                  ? "border-[#e9d8b4] bg-[#e9d8b4] text-[#17303d]"
                  : "border-white/45 bg-white/[0.08] text-white hover:bg-white/[0.22]"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="landing-up-hero relative z-10 flex max-w-[700px] flex-col gap-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e9d8b4]">{copy.eyebrow}</p>
        <h1 className="font-heading text-[40px] font-bold uppercase leading-[1.05] text-white sm:text-[56px] lg:text-[76px]">{copy.title}</h1>
        <p className="max-w-[600px] text-[17px] leading-[1.6] text-[#e6eee9] md:text-[19px]">{copy.lead}</p>
        <CtaPair copy={heroCopy} to={to} search={search} />
        <p className="max-w-[520px] text-[14px] leading-[1.6] text-[#c9d6d2]">{copy.nextStep}</p>
      </div>
    </header>
  );
}