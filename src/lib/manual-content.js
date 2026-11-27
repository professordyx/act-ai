// Conteúdo do manual de uso. Cada seção corresponde a um menu ou fluxo real do
// aplicativo e é a única fonte de verdade usada pelo assistente de IA.
export const MANUAL = [
  {
    id: "inicio",
    icon: "Rocket",
    title: { pt: "Primeiros passos", en: "Getting started", es: "Primeros pasos" },
    intro: {
      pt: "Como entrar no Act AI, escolher o idioma e entender os papéis que liberam cada etapa.",
      en: "How to sign in to Act AI, choose the language and understand the roles that unlock each step.",
      es: "Cómo entrar en Act AI, elegir el idioma y entender los roles que habilitan cada etapa.",
    },
    steps: {
      pt: [
        "Entre com e-mail e senha na tela de acesso. Se a organização usa Google, use o botão de acesso com Google. Com verificação em duas etapas ativa, informe o código do autenticador ou o código recebido por SMS.",
        "No primeiro acesso, peça ao administrador para ativar seu perfil e atribuir os papéis que você precisa. Sem papel atribuído você entra, mas não vê reuniões.",
        "Escolha o idioma da interface em PT, EN ou ES no seletor do topo. A escolha fica salva neste navegador.",
        "Use o menu superior para navegar entre Painel, Reuniões, Aprovações, Ações, Repositório, Assinatura, Administração e Manual.",
        "Em qualquer tela, use o botão de ajuda ao lado do título para ver as instruções daquela área e o botão (?) ao lado de cada rótulo para saber como preencher o campo.",
      ],
      en: [
        "Sign in with email and password. If your organization uses Google, use the Google sign-in button. With two-factor authentication on, enter the authenticator or SMS code.",
        "On your first visit, ask an administrator to activate your profile and grant the roles you need. Without a role you can sign in but will not see meetings.",
        "Pick the interface language (PT, EN or ES) in the selector at the top. The choice is saved in this browser.",
        "Use the top menu to move between Dashboard, Meetings, Approvals, Actions, Repository, Billing, Administration and Manual.",
        "On any screen, the help button next to the title explains that area, and the (?) next to each label explains how to fill the field.",
      ],
      es: [
        "Entre con correo y contraseña. Si la organización usa Google, use el botón de acceso con Google. Con verificación en dos pasos, introduzca el código del autenticador o el del SMS.",
        "En el primer acceso, pida al administrador que active su perfil y le asigne los roles necesarios. Sin rol puede entrar, pero no verá reuniones.",
        "Elija el idioma de la interfaz (PT, EN o ES) en el selector superior. La elección se guarda en este navegador.",
        "Use el menú superior para ir a Panel, Reuniones, Aprobaciones, Acciones, Repositorio, Suscripción, Administración y Manual.",
        "En cualquier pantalla, el botón de ayuda junto al título explica esa área y el botón (?) junto a cada etiqueta explica cómo rellenar el campo.",
      ],
    },
    fields: [
      { label: { pt: "E-mail", en: "Email", es: "Correo" }, how: { pt: "Use o endereço corporativo convidado para a sua conta.", en: "Use the corporate address invited to your account.", es: "Use el correo corporativo invitado a su cuenta." } },
      { label: { pt: "Senha", en: "Password", es: "Contraseña" }, how: { pt: "Se esqueceu, use 'Esqueci minha senha' e siga o link enviado por e-mail.", en: "If you forgot it, use 'Forgot password' and follow the emailed link.", es: "Si la olvidó, use 'Olvidé mi contraseña' y siga el enlace enviado." } },
      { label: { pt: "Código de verificação", en: "Verification code", es: "Código de verificación" }, how: { pt: "Seis dígitos do autenticador ou do SMS, válidos por poucos minutos.", en: "Six digits from your authenticator or SMS, valid for a few minutes.", es: "Seis dígitos del autenticador o del SMS, válidos unos minutos." } },
      { label: { pt: "Seletor de idioma", en: "Language selector", es: "Selector de idioma" }, how: { pt: "Troca o idioma da interface, das dicas e do manual sem alterar os dados.", en: "Changes the interface, tips and manual language without changing any data.", es: "Cambia el idioma de la interfaz, las ayudas y el manual sin alterar los datos." } },
    ],
    notes: {
      pt: ["Os papéis se acumulam: um organizador também pode revisar e aprovar.", "Reuniões, atas e trilha de auditoria aparecem conforme os papéis do seu perfil."],
      en: ["Roles stack: an organizer can also review and approve.", "Meetings, minutes and the audit trail appear according to your profile roles."],
      es: ["Los roles se acumulan: un organizador también puede revisar y aprobar.", "Reuniones, actas y auditoría aparecen según los roles de su perfil."],
    },
  },
  {
    id: "painel",
    icon: "LayoutDashboard",
    route: "/dashboard",
    title: { pt: "Painel", en: "Dashboard", es: "Panel" },
    intro: {
      pt: "Visão rápida do trabalho que depende de você: revisões, aprovações e ações abertas.",
      en: "A quick view of the work waiting for you: reviews, approvals and open actions.",
      es: "Vista rápida del trabajo que depende de usted: revisiones, aprobaciones y acciones abiertas.",
    },
    steps: {
      pt: [
        "Leia os indicadores no topo: reuniões acessíveis, atas aguardando revisão, aguardando aprovação e ações abertas.",
        "Clique em qualquer item das listas de pendências para abrir a reunião e agir naquela etapa.",
        "Use 'Nova reunião' para começar um registro em segundos.",
      ],
      en: [
        "Read the indicators at the top: accessible meetings, minutes awaiting review, awaiting approval and open actions.",
        "Click any pending item to open the meeting and act on that step.",
        "Use 'New meeting' to start a record in seconds.",
      ],
      es: [
        "Lea los indicadores superiores: reuniones accesibles, actas en revisión, en aprobación y acciones abiertas.",
        "Haga clic en cualquier pendiente para abrir la reunión y actuar en esa etapa.",
        "Use 'Nueva reunión' para iniciar un registro en segundos.",
      ],
    },
    fields: [
      { label: { pt: "Indicadores", en: "Indicators", es: "Indicadores" }, how: { pt: "Somam apenas as reuniões às quais o seu perfil tem acesso.", en: "They count only the meetings your profile can access.", es: "Suman solo las reuniones a las que su perfil tiene acceso." } },
      { label: { pt: "Pendências", en: "Pending items", es: "Pendientes" }, how: { pt: "Mostram o que está parado na sua etapa do fluxo.", en: "Show what is waiting at your step of the flow.", es: "Muestran lo que está detenido en su etapa del flujo." } },
    ],
    notes: {
      pt: ["Os números se recalculam ao abrir o painel."],
      en: ["Numbers are recalculated when the dashboard opens."],
      es: ["Los números se recalculan al abrir el panel."],
    },
  },
  {
    id: "reunioes",
    icon: "CalendarDays",
    route: "/meetings",
    title: { pt: "Reuniões", en: "Meetings", es: "Reuniones" },
    intro: {
      pt: "Encontre qualquer reunião por status, tipo, período ou pessoa e veja em que etapa cada ata está.",
      en: "Find any meeting by status, type, period or person and see which step each minute is at.",
      es: "Encuentre cualquier reunión por estado, tipo, período o persona y vea en qué etapa está cada acta.",
    },
    steps: {
      pt: [
        "Abra Reuniões no menu. A lista traz as reuniões visíveis para o seu perfil, da mais recente para a mais antiga.",
        "Use a busca para localizar por título ou descrição.",
        "Combine os filtros de status, tipo e período (de/até). Os filtros se somam.",
        "Informe o e-mail do organizador ou de um participante para restringir a pessoas específicas.",
        "Clique em uma reunião para abrir a ficha completa com gravação, transcrição, ata e auditoria.",
      ],
      en: [
        "Open Meetings in the menu. The list shows the meetings your profile can see, newest first.",
        "Use the search box to find a meeting by title or description.",
        "Combine status, type and period (from/to) filters. They stack.",
        "Enter the organizer or a participant email to narrow the result to specific people.",
        "Click a meeting to open its full record with recording, transcript, minutes and audit trail.",
      ],
      es: [
        "Abra Reuniones en el menú. La lista muestra las reuniones visibles para su perfil, de la más reciente a la más antigua.",
        "Use la búsqueda para localizar por título o descripción.",
        "Combine los filtros de estado, tipo y período (de/a). Los filtros se suman.",
        "Indique el correo del organizador o de un participante para limitar el resultado.",
        "Haga clic en una reunión para abrir la ficha completa con grabación, transcripción, acta y auditoría.",
      ],
    },
    fields: [
      { label: { pt: "Busca", en: "Search", es: "Búsqueda" }, how: { pt: "Procura no título e na descrição. Aceita parte da palavra.", en: "Searches title and description. Partial words work.", es: "Busca en el título y la descripción. Acepta parte de la palabra." } },
      { label: { pt: "Status", en: "Status", es: "Estado" }, how: { pt: "Mostra apenas reuniões naquela etapa: rascunho, transcrito, em revisão, aguardando aprovação, aprovada.", en: "Shows only meetings at that step: draft, transcribed, in review, awaiting approval, approved.", es: "Muestra solo reuniones en esa etapa: borrador, transcrita, en revisión, en aprobación, aprobada." } },
      { label: { pt: "Tipo", en: "Type", es: "Tipo" }, how: { pt: "Presencial, virtual ou híbrida.", en: "In person, virtual or hybrid.", es: "Presencial, virtual o híbrida." } },
      { label: { pt: "De / Até", en: "From / To", es: "Desde / Hasta" }, how: { pt: "Limita pela data agendada da reunião.", en: "Limits by the meeting's scheduled date.", es: "Limita por la fecha programada de la reunión." } },
      { label: { pt: "Organizador", en: "Organizer", es: "Organizador" }, how: { pt: "E-mail de quem criou a reunião.", en: "Email of the person who created the meeting.", es: "Correo de quien creó la reunión." } },
      { label: { pt: "Participante", en: "Participant", es: "Participante" }, how: { pt: "E-mail de alguém convidado ou presente.", en: "Email of someone invited or present.", es: "Correo de alguien invitado o presente." } },
    ],
    notes: {
      pt: ["Filtro vazio significa 'todos'.", "O status acompanha o fluxo: cada ação muda a etapa da reunião."],
      en: ["An empty filter means 'all'.", "Status follows the flow: every action moves the meeting to the next step."],
      es: ["Un filtro vacío significa 'todos'.", "El estado sigue el flujo: cada acción cambia la etapa de la reunión."],
    },
  },
  {
    id: "nova-reuniao",
    icon: "FilePlus2",
    route: "/meetings/new",
    title: { pt: "Criar uma reunião", en: "Create a meeting", es: "Crear una reunión" },
    intro: {
      pt: "O primeiro passo do registro auditável: título, data, responsáveis e ciência de gravação.",
      en: "The first step of an auditable record: title, date, responsible people and recording consent.",
      es: "El primer paso del registro auditable: título, fecha, responsables y consentimiento de grabación.",
    },
    steps: {
      pt: [
        "Clique em 'Nova reunião' no topo ou na tela de Reuniões.",
        "Informe um título claro (mínimo de 3 caracteres) e, se ajudar, uma descrição com a pauta.",
        "Defina data e hora, o tipo (presencial, virtual ou híbrida) e o local ou link.",
        "Escolha o idioma falado na reunião: ele orienta a transcrição e a redação da ata.",
        "Designe o revisor e o aprovador. São obrigatórios e precisam ter o papel correspondente.",
        "Adicione os participantes e marque a ciência de que a reunião será gravada.",
        "Envie o formulário. Você fica registrado como organizador da reunião.",
      ],
      en: [
        "Click 'New meeting' at the top or on the Meetings screen.",
        "Enter a clear title (at least 3 characters) and, if useful, a description with the agenda.",
        "Set date and time, the type (in person, virtual or hybrid) and the place or link.",
        "Choose the language spoken in the meeting: it guides transcription and the minutes.",
        "Assign the reviewer and the approver. Both are required and need the matching role.",
        "Add the participants and tick the recording consent.",
        "Submit the form. You are recorded as the meeting organizer.",
      ],
      es: [
        "Haga clic en 'Nueva reunión' arriba o en la pantalla de Reuniones.",
        "Indique un título claro (mínimo 3 caracteres) y, si ayuda, una descripción con la agenda.",
        "Defina fecha y hora, el tipo (presencial, virtual o híbrida) y el lugar o enlace.",
        "Elija el idioma hablado en la reunión: orienta la transcripción y la redacción del acta.",
        "Asigne el revisor y el aprobador. Son obligatorios y necesitan el rol correspondiente.",
        "Añada los participantes y marque el consentimiento de grabación.",
        "Envíe el formulario. Queda registrado como organizador de la reunión.",
      ],
    },
    fields: [
      { label: { pt: "Título", en: "Title", es: "Título" }, how: { pt: "Nome curto e específico, como 'Comitê de Qualidade — outubro'.", en: "A short, specific name such as 'Quality Committee — October'.", es: "Nombre corto y específico, como 'Comité de Calidad — octubre'." } },
      { label: { pt: "Descrição", en: "Description", es: "Descripción" }, how: { pt: "Pauta e contexto; ajuda a IA a gerar uma ata mais precisa.", en: "Agenda and context; helps the AI produce a more precise minute.", es: "Agenda y contexto; ayuda a la IA a generar un acta más precisa." } },
      { label: { pt: "Data e hora", en: "Date and time", es: "Fecha y hora" }, how: { pt: "Início previsto da reunião, no fuso do seu computador.", en: "Planned start, in your computer's time zone.", es: "Inicio previsto, en la zona horaria de su equipo." } },
      { label: { pt: "Idioma falado", en: "Spoken language", es: "Idioma hablado" }, how: { pt: "Idioma do áudio. Se o áudio vier em outro idioma, a transcrição é traduzida.", en: "Language of the audio. If the audio is in another language, the transcript is translated.", es: "Idioma del audio. Si el audio viene en otro idioma, la transcripción se traduce." } },
      { label: { pt: "Revisor", en: "Reviewer", es: "Revisor" }, how: { pt: "Quem confere e corrige a minuta antes da aprovação.", en: "Who checks and corrects the draft before approval.", es: "Quien revisa y corrige el borrador antes de la aprobación." } },
      { label: { pt: "Aprovador", en: "Approver", es: "Aprobador" }, how: { pt: "Quem assina a versão final. Só ele decide a aprovação.", en: "Who signs the final version. Only they decide the approval.", es: "Quien firma la versión final. Solo esa persona decide la aprobación." } },
      { label: { pt: "Participantes", en: "Participants", es: "Participantes" }, how: { pt: "Nome obrigatório; e-mail opcional, usado para notificações.", en: "Name is required; email is optional and used for notifications.", es: "El nombre es obligatorio; el correo es opcional y se usa para avisos." } },
      { label: { pt: "Ciência de gravação", en: "Recording consent", es: "Consentimiento de grabación" }, how: { pt: "Confirma que todos sabem da gravação. Sem esta marcação o envio fica bloqueado.", en: "Confirms everyone knows about the recording. Without it the form cannot be submitted.", es: "Confirma que todos saben de la grabación. Sin esta marca no se puede enviar." } },
    ],
    notes: {
      pt: ["Revisor e aprovador podem ser pessoas diferentes do organizador.", "No plano gratuito é possível criar 1 reunião por dia."],
      en: ["Reviewer and approver can be different from the organizer.", "The free plan allows 1 meeting per day."],
      es: ["Revisor y aprobador pueden ser distintos del organizador.", "El plan gratuito permite 1 reunión por día."],
    },
  },
  {
    id: "detalhe",
    icon: "Workflow",
    title: { pt: "Dentro da reunião", en: "Inside the meeting", es: "Dentro de la reunión" },
    intro: {
      pt: "O fluxo completo da ata: gravar ou enviar o áudio, transcrever, gerar a minuta, revisar, aprovar e arquivar.",
      en: "The full minutes flow: record or upload audio, transcribe, generate the draft, review, approve and archive.",
      es: "El flujo completo del acta: grabar o enviar el audio, transcribir, generar el borrador, revisar, aprobar y archivar.",
    },
    steps: {
      pt: [
        "Grave pelo navegador com o botão Gravar ou envie um arquivo de áudio. A gravação fica armazenada de forma privada.",
        "Transcreva automaticamente com o provedor configurado ou cole o texto manualmente.",
        "Escolha um modelo de ata (padrão do sistema, exemplo ou template próprio) e gere a minuta com IA.",
        "Leia e corrija o texto. Trechos marcados como 'A VALIDAR' pedem confirmação humana.",
        "Salve o rascunho e envie para revisão. O revisor designado conclui a revisão.",
        "O aprovador decide aprovar ou rejeitar, com comentário obrigatório na rejeição. A decisão gera um hash SHA-256 do conteúdo.",
        "Reuniões aprovadas podem ser arquivadas pelo administrador e baixadas em PDF.",
      ],
      en: [
        "Record in the browser with the Record button or upload an audio file. The recording is stored privately.",
        "Transcribe automatically with the configured provider or paste the text manually.",
        "Choose a minutes template (system default, example or your own) and generate the draft with AI.",
        "Read and correct the text. Passages marked 'TO VALIDATE' need human confirmation.",
        "Save the draft and send it for review. The assigned reviewer completes the review.",
        "The approver approves or rejects, with a mandatory comment on rejection. The decision creates a SHA-256 hash of the content.",
        "Approved meetings can be archived by an administrator and downloaded as PDF.",
      ],
      es: [
        "Grabe en el navegador con el botón Grabar o envíe un archivo de audio. La grabación se guarda de forma privada.",
        "Transcriba automáticamente con el proveedor configurado o pegue el texto manualmente.",
        "Elija una plantilla de acta (estándar, ejemplo o propia) y genere el borrador con IA.",
        "Lea y corrija el texto. Los tramos marcados como 'A VALIDAR' requieren confirmación humana.",
        "Guarde el borrador y envíelo a revisión. El revisor asignado completa la revisión.",
        "El aprobador aprueba o rechaza, con comentario obligatorio al rechazar. La decisión genera un hash SHA-256 del contenido.",
        "Las reuniones aprobadas pueden archivarse por el administrador y descargarse en PDF.",
      ],
    },
    fields: [
      { label: { pt: "Gravação", en: "Recording", es: "Grabación" }, how: { pt: "Aceita microfone ou arquivo. No plano gratuito, até 20 minutos por gravação.", en: "Accepts microphone or file. On the free plan, up to 20 minutes per recording.", es: "Acepta micrófono o archivo. En el plan gratuito, hasta 20 minutos por grabación." } },
      { label: { pt: "Transcrição", en: "Transcript", es: "Transcripción" }, how: { pt: "Automática usa o provedor configurado em Administração; manual aceita texto colado.", en: "Automatic uses the provider configured in Administration; manual accepts pasted text.", es: "La automática usa el proveedor configurado en Administración; la manual acepta texto pegado." } },
      { label: { pt: "Modelo de ata", en: "Minutes template", es: "Plantilla de acta" }, how: { pt: "Define o formato da ata: pauta, decisões, riscos e ações.", en: "Defines the minute format: agenda, decisions, risks and actions.", es: "Define el formato del acta: agenda, decisiones, riesgos y acciones." } },
      { label: { pt: "Editor da ata", en: "Minutes editor", es: "Editor del acta" }, how: { pt: "Ajusta o texto. Só o organizador edita, e apenas antes do envio para aprovação.", en: "Adjusts the text. Only the organizer edits, and only before submission for approval.", es: "Ajusta el texto. Solo el organizador edita, y solo antes del envío a aprobación." } },
      { label: { pt: "Resumo da alteração", en: "Change summary", es: "Resumen del cambio" }, how: { pt: "Explique o que mudou; aparece no histórico de versões.", en: "Explain what changed; it appears in the version history.", es: "Explique qué cambió; aparece en el historial de versiones." } },
      { label: { pt: "Comentário de decisão", en: "Decision comment", es: "Comentario de decisión" }, how: { pt: "Obrigatório ao rejeitar; opcional ao aprovar.", en: "Required when rejecting; optional when approving.", es: "Obligatorio al rechazar; opcional al aprobar." } },
    ],
    notes: {
      pt: ["Cada salvamento cria uma versão numerada, preservada no histórico.", "A ata é bloqueada para edição depois do envio para aprovação.", "Uma decisão sem revisão humana registrada é recusada pelo sistema."],
      en: ["Every save creates a numbered version kept in the history.", "The minute is locked for editing after it is sent for approval.", "A decision without a recorded human review is refused by the system."],
      es: ["Cada guardado crea una versión numerada conservada en el historial.", "El acta se bloquea para edición tras el envío a aprobación.", "El sistema rechaza una decisión sin revisión humana registrada."],
    },
  },
  {
    id: "aprovacoes",
    icon: "BadgeCheck",
    route: "/approvals",
    title: { pt: "Aprovações", en: "Approvals", es: "Aprobaciones" },
    intro: {
      pt: "Todas as atas que aguardam decisão, em um só lugar.",
      en: "Every minute awaiting a decision, in one place.",
      es: "Todas las actas pendientes de decisión, en un solo lugar.",
    },
    steps: {
      pt: [
        "Abra Aprovações para ver as reuniões na etapa 'aguardando aprovação'.",
        "Confira a ata revisada e o histórico de versões antes de decidir.",
        "Aprove ou rejeite com comentário. A decisão registra aprovador, data e hash do conteúdo.",
      ],
      en: [
        "Open Approvals to see the meetings at the 'awaiting approval' step.",
        "Check the reviewed minute and the version history before deciding.",
        "Approve or reject with a comment. The decision records approver, date and content hash.",
      ],
      es: [
        "Abra Aprobaciones para ver las reuniones en la etapa 'pendiente de aprobación'.",
        "Revise el acta revisada y el historial de versiones antes de decidir.",
        "Apruebe o rechace con comentario. La decisión registra aprobador, fecha y hash del contenido.",
      ],
    },
    fields: [
      { label: { pt: "Comentário", en: "Comment", es: "Comentario" }, how: { pt: "Obrigatório ao rejeitar. Ao aprovar, use para registrar ressalvas.", en: "Required when rejecting. When approving, use it to note remarks.", es: "Obligatorio al rechazar. Al aprobar, úselo para observaciones." } },
    ],
    notes: {
      pt: ["Somente o aprovador designado decide; administradores acompanham.", "Rejeitar devolve a ata ao fluxo para correção e nova decisão."],
      en: ["Only the assigned approver decides; administrators follow along.", "Rejecting returns the minute to the flow for correction and a new decision."],
      es: ["Solo el aprobador asignado decide; los administradores acompañan.", "Rechazar devuelve el acta al flujo para corrección y nueva decisión."],
    },
  },
  {
    id: "acoes",
    icon: "ListChecks",
    route: "/actions",
    title: { pt: "Ações", en: "Actions", es: "Acciones" },
    intro: {
      pt: "Itens de ação das atas, com responsável, prazo e status.",
      en: "Action items from the minutes, with owner, due date and status.",
      es: "Puntos de acción de las actas, con responsable, plazo y estado.",
    },
    steps: {
      pt: [
        "Abra Ações para ver os itens aos quais você tem acesso.",
        "Filtre por status ou ative 'Somente minhas' para ver o que é seu.",
        "Atualize o status (aberta, em andamento, concluída, cancelada) direto na lista.",
      ],
      en: [
        "Open Actions to see the items you can access.",
        "Filter by status or turn on 'Only mine' to see your own items.",
        "Update the status (open, in progress, done, cancelled) directly in the list.",
      ],
      es: [
        "Abra Acciones para ver los puntos a los que tiene acceso.",
        "Filtre por estado o active 'Solo las mías' para ver lo suyo.",
        "Actualice el estado (abierta, en curso, completada, cancelada) en la lista.",
      ],
    },
    fields: [
      { label: { pt: "Status da ação", en: "Action status", es: "Estado de la acción" }, how: { pt: "Aberta, em andamento, concluída ou cancelada.", en: "Open, in progress, done or cancelled.", es: "Abierta, en curso, completada o cancelada." } },
      { label: { pt: "Somente minhas", en: "Only mine", es: "Solo las mías" }, how: { pt: "Mostra apenas ações atribuídas a você.", en: "Shows only actions assigned to you.", es: "Muestra solo acciones asignadas a usted." } },
    ],
    notes: {
      pt: ["As ações podem ser extraídas por IA a partir da ata ou criadas manualmente na reunião.", "O link do item leva à reunião de origem."],
      en: ["Actions can be extracted by AI from the minute or created manually in the meeting.", "The item link opens the meeting it came from."],
      es: ["Las acciones pueden extraerse por IA del acta o crearse manualmente en la reunión.", "El enlace abre la reunión de origen."],
    },
  },
  {
    id: "repositorio",
    icon: "Archive",
    route: "/repository",
    title: { pt: "Repositório", en: "Repository", es: "Repositorio" },
    intro: {
      pt: "Acervo das atas aprovadas, pronto para auditoria e download.",
      en: "The archive of approved minutes, ready for audit and download.",
      es: "Archivo de las actas aprobadas, listo para auditoría y descarga.",
    },
    steps: {
      pt: [
        "Abra Repositório para consultar apenas atas aprovadas.",
        "Busque por título ou filtre por período.",
        "Abra a reunião e use Baixar PDF para gerar o documento com a decisão e o hash.",
      ],
      en: [
        "Open Repository to browse approved minutes only.",
        "Search by title or filter by period.",
        "Open the meeting and use Download PDF to generate the document with the decision and hash.",
      ],
      es: [
        "Abra Repositorio para consultar solo actas aprobadas.",
        "Busque por título o filtre por período.",
        "Abra la reunión y use Descargar PDF para generar el documento con la decisión y el hash.",
      ],
    },
    fields: [
      { label: { pt: "Busca", en: "Search", es: "Búsqueda" }, how: { pt: "Procura no título das atas aprovadas.", en: "Searches the titles of approved minutes.", es: "Busca en los títulos de las actas aprobadas." } },
    ],
    notes: {
      pt: ["O PDF é gerado no navegador e não altera o registro.", "Somente atas aprovadas entram no repositório."],
      en: ["The PDF is generated in the browser and does not change the record.", "Only approved minutes enter the repository."],
      es: ["El PDF se genera en el navegador y no altera el registro.", "Solo las actas aprobadas entran al repositorio."],
    },
  },
  {
    id: "assinatura",
    icon: "CreditCard",
    route: "/billing",
    title: { pt: "Assinatura e assentos", en: "Billing and seats", es: "Suscripción y asientos" },
    intro: {
      pt: "Plano por assentos: US$ 5 por mês por assento, cobrado na conta da empresa.",
      en: "Seat-based plan: US$ 5 per seat per month, charged to the company account.",
      es: "Plan por asientos: US$ 5 al mes por asiento, cobrado a la cuenta de la empresa.",
    },
    steps: {
      pt: [
        "Abra Assinatura para ver o estado da conta, assentos usados e custo de IA do mês.",
        "Escolha a quantidade de assentos e conclua o pagamento no checkout seguro.",
        "Depois da confirmação, atribua cada assento a um usuário na lista.",
        "Para aumentar assentos, faça um novo checkout com o total desejado.",
      ],
      en: [
        "Open Billing to see the account status, seats in use and the month's AI cost.",
        "Choose the number of seats and complete the payment in the secure checkout.",
        "After confirmation, assign each seat to a user in the list.",
        "To add seats, start a new checkout with the desired total.",
      ],
      es: [
        "Abra Suscripción para ver el estado de la cuenta, asientos usados y el costo de IA del mes.",
        "Elija la cantidad de asientos y complete el pago en el checkout seguro.",
        "Tras la confirmación, asigne cada asiento a un usuario en la lista.",
        "Para aumentar asientos, haga un nuevo checkout con el total deseado.",
      ],
    },
    fields: [
      { label: { pt: "Assentos", en: "Seats", es: "Asientos" }, how: { pt: "Cada assento custa US$ 5 por mês e libera um usuário.", en: "Each seat costs US$ 5 per month and unlocks one user.", es: "Cada asiento cuesta US$ 5 al mes y habilita un usuario." } },
      { label: { pt: "Chave do assento", en: "Seat switch", es: "Interruptor del asiento" }, how: { pt: "Ativa o acesso pago daquele usuário. Desative para liberar o assento.", en: "Grants that user's paid access. Turn it off to free the seat.", es: "Activa el acceso pago de ese usuario. Desactívelo para liberar el asiento." } },
    ],
    notes: {
      pt: ["O plano gratuito permite 1 reunião por dia e gravações de até 20 minutos.", "O custo de IA é informativo e não é cobrado à parte."],
      en: ["The free plan allows 1 meeting per day and recordings up to 20 minutes.", "The AI cost is informational and is not charged separately."],
      es: ["El plan gratuito permite 1 reunión por día y grabaciones de hasta 20 minutos.", "El costo de IA es informativo y no se cobra aparte."],
    },
  },
  {
    id: "admin",
    icon: "Settings",
    route: "/admin",
    title: { pt: "Administração", en: "Administration", es: "Administración" },
    intro: {
      pt: "Configurações da organização: pessoas, papéis, transcrição, modelos de ata e consumo de IA.",
      en: "Organization settings: people, roles, transcription, minutes templates and AI usage.",
      es: "Configuración de la organización: personas, roles, transcripción, plantillas de acta y consumo de IA.",
    },
    steps: {
      pt: [
        "Abra Administração (visível apenas para administradores).",
        "Cadastre pessoas pelo e-mail e ajuste papéis e situação (ativo/inativo) em cada cartão.",
        "Configure o provedor de transcrição, o modelo e a chave de API. A chave fica guardada no servidor.",
        "Crie modelos de ata com nome, descrição e instruções de formato; copie um modelo de exemplo para começar.",
        "Acompanhe o consumo de IA em tokens e custo estimado.",
        "Use 'Criar reunião de demonstração' para explorar o fluxo com dados de exemplo.",
      ],
      en: [
        "Open Administration (administrators only).",
        "Register people by email and adjust roles and status (active/inactive) on each card.",
        "Configure the transcription provider, model and API key. The key stays on the server.",
        "Create minutes templates with name, description and formatting instructions; copy an example to start.",
        "Follow AI usage in tokens and estimated cost.",
        "Use 'Create demo meeting' to explore the flow with sample data.",
      ],
      es: [
        "Abra Administración (solo administradores).",
        "Registre personas por correo y ajuste roles y situación (activo/inactivo) en cada tarjeta.",
        "Configure el proveedor de transcripción, el modelo y la clave de API. La clave se guarda en el servidor.",
        "Cree plantillas de acta con nombre, descripción e instrucciones de formato; copie un ejemplo para empezar.",
        "Siga el consumo de IA en tokens y costo estimado.",
        "Use 'Crear reunión de demostración' para explorar el flujo con datos de ejemplo.",
      ],
    },
    fields: [
      { label: { pt: "E-mail da pessoa", en: "Person email", es: "Correo de la persona" }, how: { pt: "Endereço de quem já tem conta no aplicativo.", en: "Address of someone who already has an account.", es: "Correo de quien ya tiene cuenta en la aplicación." } },
      { label: { pt: "Papéis", en: "Roles", es: "Roles" }, how: { pt: "Definem o que a pessoa pode fazer. Administrador vê e altera tudo.", en: "Define what the person can do. Administrators see and change everything.", es: "Definen lo que la persona puede hacer. El administrador ve y cambia todo." } },
      { label: { pt: "Provedor de transcrição", en: "Transcription provider", es: "Proveedor de transcripción" }, how: { pt: "Serviço usado na transcrição automática do áudio.", en: "Service used to transcribe audio automatically.", es: "Servicio usado para transcribir el audio automáticamente." } },
      { label: { pt: "Chave de API", en: "API key", es: "Clave de API" }, how: { pt: "Credencial do provedor. Nunca é exibida de volta, apenas os 4 últimos caracteres.", en: "Provider credential. Never shown again, only the last 4 characters.", es: "Credencial del proveedor. Nunca se muestra de nuevo, solo los 4 últimos caracteres." } },
      { label: { pt: "Nome do modelo de ata", en: "Template name", es: "Nombre de la plantilla" }, how: { pt: "Identifica o template na hora de gerar a ata.", en: "Identifies the template when generating a minute.", es: "Identifica la plantilla al generar el acta." } },
      { label: { pt: "Instruções do template", en: "Template instructions", es: "Instrucciones de la plantilla" }, how: { pt: "Descreva seções, tom e o que destacar. Quanto mais específico, melhor a ata.", en: "Describe sections, tone and what to highlight. The more specific, the better the minute.", es: "Describa secciones, tono y qué destacar. Cuanto más específico, mejor el acta." } },
    ],
    notes: {
      pt: ["Toda alteração administrativa entra na trilha de auditoria.", "Sem chave configurada, a transcrição automática fica indisponível e o modo manual continua funcionando."],
      en: ["Every administrative change enters the audit trail.", "Without a key, automatic transcription is unavailable and manual mode keeps working."],
      es: ["Todo cambio administrativo entra en la auditoría.", "Sin clave, la transcripción automática no está disponible y el modo manual sigue funcionando."],
    },
  },
  {
    id: "auditoria",
    icon: "ShieldCheck",
    title: { pt: "Conformidade e auditoria", en: "Compliance and audit", es: "Cumplimiento y auditoría" },
    intro: {
      pt: "O que sustenta a conformidade: rastreabilidade, revisão humana e versões preservadas.",
      en: "What supports compliance: traceability, human review and preserved versions.",
      es: "Lo que sostiene el cumplimiento: trazabilidad, revisión humana y versiones preservadas.",
    },
    steps: {
      pt: [
        "Cada reunião mostra a linha do tempo de eventos: criação, gravação, transcrição, geração, revisão, decisão e arquivamento.",
        "O histórico de versões guarda cada texto salvo, com autor, data e resumo da alteração.",
        "A decisão de aprovação registra o hash SHA-256 do conteúdo aprovado.",
        "No download em PDF, o documento traz a decisão, o responsável e o hash para conferência.",
      ],
      en: [
        "Each meeting shows the event timeline: creation, recording, transcription, generation, review, decision and archiving.",
        "The version history keeps every saved text with author, date and change summary.",
        "The approval decision records the SHA-256 hash of the approved content.",
        "The PDF download carries the decision, the responsible person and the hash for verification.",
      ],
      es: [
        "Cada reunión muestra la línea de tiempo: creación, grabación, transcripción, generación, revisión, decisión y archivo.",
        "El historial de versiones guarda cada texto guardado con autor, fecha y resumen del cambio.",
        "La decisión de aprobación registra el hash SHA-256 del contenido aprobado.",
        "El PDF incluye la decisión, el responsable y el hash para verificación.",
      ],
    },
    fields: [],
    notes: {
      pt: ["Uma ata aprovada não é editada: uma correção exige nova versão e nova decisão.", "Guarde os PDFs como evidência para auditorias ISO 9001, HACCP e ISO 22000."],
      en: ["An approved minute is not edited: a correction requires a new version and a new decision.", "Keep the PDFs as evidence for ISO 9001, HACCP and ISO 22000 audits."],
      es: ["Un acta aprobada no se edita: una corrección exige nueva versión y nueva decisión.", "Guarde los PDF como evidencia para auditorías ISO 9001, HACCP e ISO 22000."],
    },
  },
  {
    id: "ajuda",
    icon: "LifeBuoy",
    route: "/manual",
    title: { pt: "Ajuda e assistente", en: "Help and assistant", es: "Ayuda y asistente" },
    intro: {
      pt: "Manual, assistente de IA e dicas nos campos, sempre à mão.",
      en: "Manual, AI assistant and field tips, always at hand.",
      es: "Manual, asistente de IA y ayudas en los campos, siempre a mano.",
    },
    steps: {
      pt: [
        "Abra Manual no menu para consultar todas as áreas e fluxos.",
        "Use a busca do manual para encontrar um assunto rapidamente.",
        "Pergunte ao assistente: ele responde com base no conteúdo do manual e avisa quando algo não está coberto.",
        "Ao lado de cada rótulo há um botão de ajuda (?); ao focar um campo, a dica aparece abaixo dele.",
      ],
      en: [
        "Open Manual in the menu to read every area and flow.",
        "Use the manual search to find a topic quickly.",
        "Ask the assistant: it answers from the manual content and says when something is not covered.",
        "Each label has a (?) help button; focusing a field shows its tip right below it.",
      ],
      es: [
        "Abra Manual en el menú para consultar todas las áreas y flujos.",
        "Use la búsqueda del manual para encontrar un tema rápido.",
        "Pregunte al asistente: responde con base en el contenido del manual y avisa si algo no está cubierto.",
        "Cada etiqueta tiene un botón de ayuda (?); al enfocar un campo, la ayuda aparece debajo.",
      ],
    },
    fields: [],
    notes: {
      pt: ["O assistente não acessa seus dados de reuniões: responde apenas sobre como usar o programa.", "As respostas aparecem no idioma da interface."],
      en: ["The assistant does not access your meeting data: it answers only about how to use the program.", "Answers appear in the interface language."],
      es: ["El asistente no accede a sus datos de reuniones: responde solo sobre cómo usar el programa.", "Las respuestas aparecen en el idioma de la interfaz."],
    },
  },
];

export const manualSection = (id) => MANUAL.find((s) => s.id === id);

// Texto corrido do manual, usado como contexto do assistente de IA.
export const manualKnowledge = (lang = "pt") => {
  const L = ["pt", "en", "es"].includes(lang) ? lang : "pt";
  return MANUAL.map((s) => {
    const lines = [`## ${s.title[L]}`, s.intro[L], ...(s.steps[L] || []).map((step, i) => `${i + 1}. ${step}`)];
    if (s.fields.length) lines.push(...s.fields.map((f) => `- ${f.label[L]}: ${f.how[L]}`));
    if (s.notes[L]?.length) lines.push(...s.notes[L].map((n) => `* ${n}`));
    return lines.join("\n");
  }).join("\n\n");
};