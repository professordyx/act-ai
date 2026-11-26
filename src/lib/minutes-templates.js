// Modelos padrão de prompt (somente leitura: podem ser copiados, nunca editados).
// Os templates próprios ficam na entidade MinutesTemplate e são gerenciados por administradores.

export const DEFAULT_TEMPLATES = [
  {
    key: "corporativo",
    name: "Padrão corporativo",
    description: "Estrutura clássica: objetivo, participantes, tópicos, decisões, ações e riscos.",
    prompt: `Redija a ata em seções numeradas com títulos em maiúsculas:
1. OBJETIVO DA REUNIÃO
2. PARTICIPANTES
3. TÓPICOS DISCUTIDOS (um subtítulo por assunto)
4. DECISÕES TOMADAS (lista numerada, uma decisão por item)
5. AÇÕES (ação | responsável | prazo)
6. RISCOS E PENDÊNCIAS
Linguagem formal, impessoal e objetiva, em terceira pessoa. Frases curtas.`,
  },
  {
    key: "conformidade",
    name: "Ata formal de conformidade",
    description: "Registro auditável com cabeçalho, deliberações e evidências.",
    prompt: `Redija a ata como registro formal de conformidade:
CABEÇALHO: identificação da reunião, data, local, horário de início e de encerramento, presentes e suas funções.
ORDEM DO DIA: itens previstos.
DELIBERAÇÕES: para cada item, resumo da discussão, decisão registrada e responsável pela execução.
EVIDÊNCIAS E REFERÊNCIAS: documentos, normas ou registros citados (somente se citados na transcrição).
ENCERRAMENTO: declaração de que a ata foi lida e registrada, com espaço para revisão e aprovação.
Linguagem jurídica e impessoal, sem opiniões.`,
  },
  {
    key: "executivo",
    name: "Resumo executivo",
    description: "Versão curta para diretoria: contexto, decisões e próximos passos.",
    prompt: `Redija uma ata executiva de no máximo uma página:
CONTEXTO (2 a 3 frases)
PRINCIPAIS DECISÕES (no máximo 5 marcadores)
PRÓXIMOS PASSOS (responsável e prazo de cada um)
PONTOS DE ATENÇÃO
Texto direto e afirmativo, sem repetições.`,
  },
];

// Resolve o template escolhido na geração: próprio (entidade) ou modelo padrão.
export async function resolveTemplate(sdb, { id, key } = {}) {
  if (id) {
    const t = await sdb.entities.MinutesTemplate.get(id).catch(() => null);
    if (t) return { id: t.id, name: t.name, prompt: t.prompt };
  }
  if (key) {
    const e = DEFAULT_TEMPLATES.find((x) => x.key === key);
    if (e) return { id: undefined, name: e.name, prompt: e.prompt };
  }
  return null;
}