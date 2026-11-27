import { BadgeCheck, Fingerprint, ListChecks, Quote, ShieldCheck } from "lucide-react";
import { Eyebrow, Section } from "@/components/landing/parts";

export default function ProductDemo({ demo }) {
  const m = demo.mock;
  return (
    <Section id="exemplo" className="pt-0">
      <div className="flex max-w-[820px] flex-col gap-5">
        <Eyebrow>{demo.eyebrow}</Eyebrow>
        <h2 className="font-heading text-[30px] font-bold uppercase leading-[1.1] text-[#17303d] sm:text-[36px] lg:text-[42px]">{demo.title}</h2>
        <p className="text-[17px] leading-[1.6] text-[#44596a] md:text-[18px]">{demo.lead}</p>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-[#e4d9c2] bg-white shadow-[0_12px_28px_rgba(23,48,61,0.14)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4d9c2] bg-[#fbf7ee] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#2f6b56] text-white">
              <ShieldCheck className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </span>
            <div>
              <p className="font-heading text-[17px] font-bold uppercase leading-[1.2] text-[#17303d]">{m.windowTitle}</p>
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6b7f8c]">{m.meta}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#2f6b56] px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-white">
            <BadgeCheck className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            {m.badge}
          </span>
        </div>

        <div className="grid divide-y divide-[#eee3cd] md:grid-cols-[1.05fr_1fr_1fr] md:divide-x md:divide-y-0">
          <div className="flex flex-col gap-3 p-6">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#2f6b56]">
              <Quote className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              {m.transcriptLabel}
            </p>
            <p className="rounded-xl border-l-[4px] border-[#e9d8b4] bg-[#fff7e3] px-4 py-3 text-[14px] italic leading-[1.6] text-[#17303d]">{m.transcript}</p>
            <p className="text-[13px] leading-[1.6] text-[#6b7f8c]">{m.transcriptSource}</p>
          </div>

          <div className="flex flex-col gap-3 p-6">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#2f6b56]">
              <ListChecks className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              {m.decisionsLabel}
            </p>
            <ul className="flex flex-col gap-2">
              {m.decisions.map((d) => (
                <li key={d} className="flex gap-2 text-[14px] leading-[1.5] text-[#17303d]">
                  <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#2f6b56]" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 p-6">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#2f6b56]">
              <ListChecks className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              {m.actionsLabel}
            </p>
            <ul className="flex flex-col gap-2">
              {m.actions.map((a) => (
                <li key={a.title} className="rounded-xl border border-[#e4d9c2] bg-[#fbf7ee] px-3 py-2">
                  <p className="text-[14px] font-semibold leading-[1.4] text-[#17303d]">{a.title}</p>
                  <p className="text-[12px] leading-[1.5] text-[#6b7f8c]">{a.owner} · {a.due}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e4d9c2] bg-[#17303d] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e9d8b4] text-[#17303d]">
              <BadgeCheck className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9fb8c0]">{m.approvalLabel}</p>
              <p className="text-[14px] font-semibold text-white">{m.approver} · {m.approvedAt}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#3d5a68] px-3 py-2">
            <Fingerprint className="h-4 w-4 text-[#e9d8b4]" strokeWidth={2} aria-hidden="true" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9fb8c0]">{m.hashLabel}</p>
              <p className="font-mono text-[12px] text-white">{m.hash}</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[13px] text-[#6b7f8c]">{demo.note}</p>
    </Section>
  );
}