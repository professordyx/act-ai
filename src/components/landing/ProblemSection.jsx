import { Mic, Users, Wallet } from "lucide-react";
import { Image } from "@/components/ui/image";
import { LANDING_IMAGES } from "@/lib/landing-copy";
import { Eyebrow, InfoCard, Section } from "@/components/landing/parts";

const ICONS = [Users, Mic, Wallet];

export default function ProblemSection({ copy, transcription }) {
  return (
    <>
      <Section>
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <h2 className="max-w-[760px] font-heading text-[32px] font-bold uppercase leading-[1.1] text-[#17303d] sm:text-[38px] lg:text-[46px]">{copy.title}</h2>
        <p className="max-w-[720px] text-[17px] leading-[1.6] text-[#44596a] md:text-[18px]">{copy.lead}</p>
        <div className="grid gap-6 md:grid-cols-3">
          {copy.cards.map((card, i) => (
            <InfoCard key={card.title} icon={ICONS[i]} title={card.title} body={card.body} />
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <Image
            src={LANDING_IMAGES.transcription}
            alt={transcription.imageAlt}
            className="aspect-[4/3] w-full rounded-[20px] border border-[#e4d9c2] object-cover shadow-[0_12px_28px_rgba(23,48,61,0.14)]"
            fittingType="fill"
          />
          <div className="flex flex-col gap-5">
            <Eyebrow>{transcription.eyebrow}</Eyebrow>
            <h2 className="font-heading text-[30px] font-bold uppercase leading-[1.1] text-[#17303d] sm:text-[36px] lg:text-[42px]">{transcription.title}</h2>
            <p className="text-[17px] leading-[1.6] text-[#44596a] md:text-[18px]">{transcription.lead}</p>
            <p className="rounded-xl border-l-[5px] border-[#2f6b56] bg-[#fff7e3] px-[22px] py-[18px] text-[15px] leading-[1.6] text-[#17303d] shadow-[0_4px_12px_rgba(23,48,61,0.08)]">{transcription.note}</p>
          </div>
        </div>
      </Section>
    </>
  );
}