import { Link } from "@tanstack/react-router";

export function Eyebrow({ children, tone = "green" }) {
  const color = tone === "cream" ? "text-[#e9d8b4]" : "text-[#2f6b56]";
  return <p className={`text-xs font-bold uppercase tracking-[0.2em] ${color}`}>{children}</p>;
}

export function Section({ id, className = "", children }) {
  return (
    <section id={id} className={`landing-up flex flex-col gap-12 px-6 py-16 md:px-16 md:py-24 ${className}`}>
      {children}
    </section>
  );
}

export function InfoCard({ icon: Icon, title, body, dark = false }) {
  return (
    <div
      className={
        dark
          ? "flex flex-col gap-[14px] rounded-[20px] border border-[#2f5565] bg-[#1f3f4d] p-8"
          : "flex flex-col gap-[14px] rounded-[20px] border border-[#e4d9c2] bg-white p-8 shadow-[0_12px_28px_rgba(23,48,61,0.1)] transition-shadow duration-200 hover:shadow-[0_16px_34px_rgba(23,48,61,0.18)]"
      }
    >
      <div className={`flex h-[52px] w-[52px] items-center justify-center rounded-[14px] ${dark ? "bg-[#e9d8b4] text-[#17303d]" : "bg-[#2f6b56] text-white"}`}>
        <Icon className="h-[26px] w-[26px]" strokeWidth={2} aria-hidden="true" />
      </div>
      <h3 className={`font-heading text-[24px] font-bold uppercase leading-[1.1] ${dark ? "text-white" : "text-[#17303d]"}`}>{title}</h3>
      <p className={`text-[15px] leading-[1.6] ${dark ? "text-[#c9d6d2]" : "text-[#44596a]"}`}>{body}</p>
    </div>
  );
}

const BTN = "inline-flex items-center justify-center rounded-xl border-2 border-[#e9d8b4] px-8 py-4 text-[15px] font-bold transition-[box-shadow,background-color,color] duration-200 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-white focus-visible:outline-offset-[3px]";

export function PrimaryCta({ to, search, children }) {
  return (
    <Link
      to={to}
      search={search}
      className={`${BTN} bg-[#e9d8b4] text-[#17303d] hover:shadow-[0_8px_22px_rgba(0,0,0,0.35)] active:shadow-[0_2px_6px_rgba(0,0,0,0.35)]`}
    >
      {children}
    </Link>
  );
}

export function SecondaryCta({ children }) {
  return (
    <a href="#vantagens" className={`${BTN} bg-transparent text-white hover:bg-white/[0.14]`}>
      {children}
    </a>
  );
}

export function CtaPair({ copy, to, search }) {
  return (
    <div className="flex flex-wrap gap-4">
      <PrimaryCta to={to} search={search}>{copy.primary}</PrimaryCta>
      <SecondaryCta>{copy.secondary}</SecondaryCta>
    </div>
  );
}