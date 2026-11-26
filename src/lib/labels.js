export const STATUS_CLASS = {
  rascunho: "bg-slate-100 text-slate-700",
  aguardando_upload: "bg-amber-50 text-amber-800",
  gravacao_enviada: "bg-sky-50 text-sky-800",
  processando_transcricao: "bg-sky-50 text-sky-800",
  transcrito: "bg-sky-50 text-sky-800",
  minuta_gerada: "bg-indigo-50 text-indigo-800",
  em_revisao: "bg-orange-50 text-orange-800",
  aguardando_aprovacao: "bg-[#213A48] text-white",
  aprovada: "bg-emerald-50 text-emerald-800",
  rejeitada: "bg-rose-50 text-rose-800",
  arquivada: "bg-slate-200 text-slate-700",
};
export const STATUS_KEYS = Object.keys(STATUS_CLASS);

export const ACTION_STATUS_KEYS = ["aberta", "em_andamento", "concluida", "cancelada"];
export const ROLE_KEYS = ["admin", "organizer", "reviewer", "approver", "participant", "auditor"];
export const LOCATION_KEYS = ["presencial", "virtual", "hibrida"];
export const MEETING_ROLE_KEYS = ["organizador", "participante", "revisor", "aprovador", "convidado"];

export const fmt = (d, withTime = true, locale = "pt-BR") =>
  d
    ? new Date(d).toLocaleString(locale, {
        timeZone: "America/Sao_Paulo",
        dateStyle: "short",
        ...(withTime ? { timeStyle: "short" } : {}),
      })
    : "—";