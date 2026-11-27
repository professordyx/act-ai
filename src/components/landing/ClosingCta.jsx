import { ShieldCheck } from "lucide-react";
import { CtaPair } from "@/components/landing/parts";

export default function ClosingCta({ copy, to, search }) {
  return (
    <section className="mx-6 mb-20 flex flex-col items-start gap-6 rounded-[20px] bg-[linear-gradient(135deg,#2f6b56_0%,#17303d_100%)] p-8 shadow-[0_12px_28px_rgba(23,48,61,0.25)] md:mx-16 md:p-[72px]">
      <h2 className="max-w-[760px] font-heading text-[32px] font-bold uppercase leading-[1.1] text-white sm:text-[38px] lg:text-[48px]">{copy.title}</h2>
      <p className="max-w-[640px] text-[17px] leading-[1.6] text-[#e6eee9] md:text-[18px]">{copy.lead}</p>
      <CtaPair copy={copy} to={to} search={search} />
      <p className="flex items-center gap-2 text-[13px] font-semibold text-[#e9d8b4]">
        <ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
        {copy.riskNote}
      </p>
    </section>
  );
}