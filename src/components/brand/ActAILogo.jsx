import ActAIMark from "@/components/brand/ActAIMark";

// Logo completo. tone="dark" para fundos claros, "light" para fundos escuros.
export default function ActAILogo({ tone = "dark", className = "", markClass = "h-8 w-8", textClass = "text-2xl" }) {
  const light = tone === "light";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <ActAIMark className={markClass} />
      <span className={`font-heading font-bold leading-none ${textClass} ${light ? "text-white" : "text-[#274360]"}`}>
        Act <span className={`font-normal ${light ? "text-[#CFE3DF]" : "text-[#2B6F64]"}`}>AI</span>
      </span>
    </span>
  );
}