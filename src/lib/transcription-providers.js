// Catálogo de provedores e modelos de transcrição por chave própria.
// Usado tanto na interface (seleção) quanto na validação do servidor.

export const TRANSCRIPTION_PROVIDERS = [
  {
    id: "openai",
    label: "OpenAI",
    models: [
      { id: "gpt-4o-transcribe", label: "gpt-4o-transcribe" },
      { id: "gpt-4o-mini-transcribe", label: "gpt-4o-mini-transcribe" },
      { id: "whisper-1", label: "whisper-1" },
    ],
  },
  {
    id: "google",
    label: "Google Speech-to-Text",
    models: [
      { id: "latest_long", label: "latest_long" },
      { id: "latest_short", label: "latest_short" },
      { id: "long", label: "long" },
      { id: "short", label: "short" },
      { id: "video", label: "video" },
      { id: "phone_call", label: "phone_call" },
    ],
  },
  {
    id: "assemblyai",
    label: "AssemblyAI",
    models: [
      { id: "best", label: "best" },
      { id: "nano", label: "nano" },
    ],
  },
];

export const providerById = (id) => TRANSCRIPTION_PROVIDERS.find((p) => p.id === id) || null;

export const isValidModel = (id, model) => !!providerById(id)?.models.some((m) => m.id === model);