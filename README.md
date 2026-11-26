# Atas de Reunião Auditáveis (MVP)

Fluxo: gravar → transcrever → gerar ata → revisar → aprovar → armazenar → consultar.

## Arquitetura
- Frontend: TanStack Start + React + Tailwind + shadcn/ui (identidade Diocélio Goulart). Rotas em `src/routes/_authed/`.
- Backend: server functions em `src/lib/*-fns.js`; regras e helpers (perfis, auditoria, e-mail, prompts) em `src/lib/meeting.server.js`.
- Dados: entidades em `base44/entities/` (todas admin-only por RLS; o acesso passa pelas server functions, que validam perfil e vínculo com a reunião).
- Integrações nativas: InvokeLLM (ata e ações), TranscribeAudio (transcrição), UploadPrivateFile (áudio, privado), SendEmail.

## Perfis
Admin (da plataforma, todos os papéis), organizador, revisor, aprovador, participante, auditoria. Definidos em Administração > UserProfile.

## Regras-chave
Revisão humana obrigatória antes da aprovação; aprovação registra hash SHA-256 do conteúdo; ata aprovada fica bloqueada; todo evento crítico gera AuditLog.

## Limitações e próximos passos
- Transcrição automática sem identificação de falantes e limitada a 25 MB; fallback manual e modo demonstração.
- E-mails só chegam a usuários cadastrados no app.
- Pontos a validar: retenção de gravações, segregação organizador/aprovador, assinatura qualificada, formato exigido por auditores ISO 9001/HACCP/ISO 22000.
- Fora do MVP: multiempresa, multidioma, assistente de consulta, calendário.
