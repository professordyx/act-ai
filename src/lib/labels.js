export const STATUS = {
  rascunho: ["Rascunho", "bg-slate-100 text-slate-700"],
  aguardando_upload: ["Aguardando gravação", "bg-amber-50 text-amber-800"],
  gravacao_enviada: ["Gravação enviada", "bg-sky-50 text-sky-800"],
  processando_transcricao: ["Transcrevendo", "bg-sky-50 text-sky-800"],
  transcrito: ["Transcrito", "bg-sky-50 text-sky-800"],
  minuta_gerada: ["Minuta gerada", "bg-indigo-50 text-indigo-800"],
  em_revisao: ["Em revisão", "bg-orange-50 text-orange-800"],
  aguardando_aprovacao: ["Aguardando aprovação", "bg-[#213A48] text-white"],
  aprovada: ["Aprovada", "bg-emerald-50 text-emerald-800"],
  rejeitada: ["Rejeitada", "bg-rose-50 text-rose-800"],
  arquivada: ["Arquivada", "bg-slate-200 text-slate-700"],
};
export const ACTION_STATUS = { aberta: "Aberta", em_andamento: "Em andamento", concluida: "Concluída", cancelada: "Cancelada" };
export const ROLE_LABEL = { admin: "Administrador", organizer: "Organizador", reviewer: "Revisor", approver: "Aprovador", participant: "Participante", auditor: "Auditoria/Qualidade" };
export const LOCATION = { presencial: "Presencial", virtual: "Virtual", hibrida: "Híbrida" };

export const fmt = (d, withTime = true) =>
  d ? new Date(d).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", ...(withTime ? { timeStyle: "short" } : {}) }) : "—";