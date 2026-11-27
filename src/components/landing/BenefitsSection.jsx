import { Eye, ListChecks, ShieldCheck } from "lucide-react";
import { Eyebrow, InfoCard, Section } from "@/components/landing/parts";

const ICONS = [ShieldCheck, ListChecks, Eye];

export default function BenefitsSection({ copy }) {
  return (
    <Section id="vantagens" className="bg-[#17303d] text-white">
      <Eyebrow tone="cream">{copy.eyebrow}</Eyebrow>
      <h2 className="max-w-[760px] font-heading text-[32px] font-bold uppercase leading-[1.1] text-white sm:text-[38px] lg:text-[46px]">{copy.title}</h2>
      <p className="max-w-[720px] text-[17px] leading-[1.6] text-[#c9d6d2] md:text-[18px]">{copy.lead}</p>
      <div className="grid gap-6 md:grid-cols-3">
        {copy.cards.map((card, i) => (
          <InfoCard key={card.title} icon={ICONS[i]} title={card.title} body={card.body} dark />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {copy.stats.map((stat) => (
          <div key={stat.label} className="border-t-[3px] border-[#e9d8b4] pt-4">
            <b className="block font-heading text-[44px] font-bold leading-none text-[#e9d8b4]">{stat.value}</b>
            <span className="text-[15px] text-[#c9d6d2]">{stat.label}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}