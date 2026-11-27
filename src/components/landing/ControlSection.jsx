import { Image } from "@/components/ui/image";
import { LANDING_IMAGES } from "@/lib/landing-copy";
import { Eyebrow, Section } from "@/components/landing/parts";

export default function ControlSection({ control, languages }) {
  return (
    <>
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col gap-5">
            <Eyebrow>{control.eyebrow}</Eyebrow>
            <h2 className="font-heading text-[30px] font-bold uppercase leading-[1.1] text-[#17303d] sm:text-[36px] lg:text-[42px]">{control.title}</h2>
            <p className="text-[17px] leading-[1.6] text-[#44596a] md:text-[18px]">{control.lead}</p>
            <p className="rounded-xl border-l-[5px] border-[#2f6b56] bg-[#fff7e3] px-[22px] py-[18px] text-[15px] leading-[1.6] text-[#17303d] shadow-[0_4px_12px_rgba(23,48,61,0.08)]">{control.note}</p>
          </div>
          <Image
            src={LANDING_IMAGES.control}
            alt={control.imageAlt}
            className="aspect-[4/3] w-full rounded-[20px] border border-[#e4d9c2] object-cover shadow-[0_12px_28px_rgba(23,48,61,0.14)]"
            fittingType="fill"
          />
        </div>
      </Section>

      <Section className="pt-0">
        <Eyebrow>{languages.eyebrow}</Eyebrow>
        <h2 className="max-w-[760px] font-heading text-[30px] font-bold uppercase leading-[1.1] text-[#17303d] sm:text-[36px] lg:text-[46px]">{languages.title}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {languages.cards.map((card) => (
            <div key={card.name} className="flex flex-col gap-[10px] rounded-[20px] border border-[#e4d9c2] bg-white p-7 shadow-[0_4px_12px_rgba(23,48,61,0.08)]">
              <h3 className="font-heading text-[22px] font-bold uppercase leading-[1.1] text-[#2f6b56]">{card.name}</h3>
              <p className="text-[15px] leading-[1.6] text-[#44596a]">{card.body}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}