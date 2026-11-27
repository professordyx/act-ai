// Transcrição com chave própria do administrador (OpenAI, Google, AssemblyAI).
// Roda apenas no servidor: a chave nunca sai daqui.
import { fail } from "@/lib/meeting-core";
import { providerById } from "@/lib/transcription-providers";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Idioma da reunião → código aceito por cada provedor.
const GOOGLE_LANG = { pt: "pt-BR", en: "en-US", es: "es-ES" };
const ISO_LANG = { pt: "pt", en: "en", es: "es" };

export async function loadTranscriptionConfig(sdb) {
  const page = await sdb.entities.TranscriptionSettings.filter({ isActive: true }, { limit: 1 });
  const s = page.items[0];
  if (!s?.apiKey || !s?.model || !providerById(s.provider)) return null;
  return { provider: s.provider, model: s.model, apiKey: s.apiKey };
}

const providerError = (name, status, body) => {
  const raw = body?.error?.message || body?.error || body?.message || "";
  const detail = typeof raw === "string" ? raw.slice(0, 180) : "";
  const hint =
    status === 401 || status === 403
      ? "chave inválida ou sem permissão"
      : status === 429
        ? "limite de uso atingido"
        : status === 413
          ? "arquivo grande demais"
          : "requisição recusada (verifique a chave e o modelo)";
  return fail(`${name}: ${hint} (HTTP ${status})${detail ? ` — ${detail}` : ""}`, 502);
};

const kindOf = (mime = "") =>
  mime.includes("webm")
    ? "webm"
    : mime.includes("ogg")
      ? "ogg"
      : mime.includes("mp4") || mime.includes("m4a")
        ? "m4a"
        : mime.includes("mpeg") || mime.includes("mp3")
          ? "mp3"
          : mime.includes("wav")
            ? "wav"
            : mime.includes("flac")
              ? "flac"
              : "audio";

async function signedUrlFor(sdb, fileUri) {
  const r = await sdb.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 3600 });
  if (!r?.signed_url) fail("Não foi possível acessar a gravação no armazenamento privado", 502);
  return r.signed_url;
}

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) fail("Não foi possível ler a gravação no armazenamento privado", 502);
  return res.arrayBuffer();
}

const toBase64 = (buf) => {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
};

async function openai(cfg, url, mime, language) {
  const bytes = await download(url);
  if (bytes.byteLength > 25 * 1024 * 1024) fail("A OpenAI aceita áudios de até 25 MB", 413);
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: mime || "audio/webm" }), `audio.${kindOf(mime)}`);
  form.append("model", cfg.model);
  form.append("response_format", "json");
  if (ISO_LANG[language]) form.append("language", ISO_LANG[language]);
  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.apiKey}` },
    body: form,
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) providerError("OpenAI", res.status, body);
  return body?.text || "";
}

const GOOGLE_CONFIG = {
  webm: { encoding: "WEBM_OPUS", sampleRateHertz: 48000 },
  ogg: { encoding: "OGG_OPUS", sampleRateHertz: 48000 },
  flac: { encoding: "FLAC" },
  mp3: { encoding: "MP3" },
  wav: {},
};

async function google(cfg, url, mime, language) {
  const kind = kindOf(mime);
  if (!(kind in GOOGLE_CONFIG)) fail("O Google Speech-to-Text não aceita este formato de áudio. Use WebM, OGG, WAV, FLAC ou MP3.");
  const bytes = await download(url);
  if (bytes.byteLength > 10 * 1024 * 1024) fail("O reconhecimento síncrono do Google aceita áudios de até 10 MB", 413);
  const res = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${encodeURIComponent(cfg.apiKey)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      config: { languageCode: GOOGLE_LANG[language] || GOOGLE_LANG.pt, model: cfg.model, ...GOOGLE_CONFIG[kind] },
      audio: { content: toBase64(bytes) },
    }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) providerError("Google", res.status, body);
  return (body?.results || []).map((r) => r.alternatives?.[0]?.transcript || "").join(" ").trim();
}

async function assemblyai(cfg, url, language) {
  const created = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: { authorization: cfg.apiKey, "content-type": "application/json" },
    body: JSON.stringify({ audio_url: url, speech_model: cfg.model === "nano" ? "nano" : "best", language_code: ISO_LANG[language] || ISO_LANG.pt }),
  });
  const job = await created.json().catch(() => null);
  if (!created.ok || !job?.id) providerError("AssemblyAI", created.status, job);
  for (let i = 0; i < 15; i += 1) {
    await sleep(3000);
    const res = await fetch(`https://api.assemblyai.com/v2/transcript/${job.id}`, { headers: { authorization: cfg.apiKey } });
    const body = await res.json().catch(() => null);
    if (!res.ok) providerError("AssemblyAI", res.status, body);
    if (body?.status === "completed") return body.text || "";
    if (body?.status === "error") fail(`AssemblyAI: ${String(body.error || "falha na transcrição").slice(0, 200)}`, 502);
  }
  fail("O AssemblyAI ainda está processando o áudio. Tente novamente em alguns instantes.", 504);
}

// Garante que o texto final esteja no idioma configurado na reunião: os provedores
// transcrevem no idioma falado no áudio, não no idioma pedido.
const LANG_LABELS = { pt: "português do Brasil", en: "inglês", es: "espanhol" };

export async function detectTextLanguage(sdb, text) {
  const res = await sdb.integrations.Core.InvokeLLM({
    prompt: `Identifique o idioma predominante do texto abaixo. Responda apenas com o código: pt (português), en (inglês) ou es (espanhol).\n\n"""${text.slice(0, 2000)}"""`,
    response_json_schema: { type: "object", properties: { language: { type: "string" } }, required: ["language"] },
  });
  const code = String(res?.language || "").slice(0, 2).toLowerCase();
  return ["pt", "en", "es"].includes(code) ? code : null;
}

const chunkText = (text, size = 7000) => {
  const chunks = [];
  let rest = text;
  while (rest.length > size) {
    const cut = rest.lastIndexOf("\n", size);
    const at = cut > size / 2 ? cut : size;
    chunks.push(rest.slice(0, at));
    rest = rest.slice(at);
  }
  if (rest.trim()) chunks.push(rest);
  return chunks;
};

export async function translateTranscript(sdb, text, target) {
  const label = LANG_LABELS[target] || LANG_LABELS.pt;
  const out = [];
  for (const chunk of chunkText(text)) {
    const res = await sdb.integrations.Core.InvokeLLM({
      prompt: `Traduza para ${label} o trecho de transcrição de reunião abaixo. Preserve nomes próprios, números, datas, siglas e a ordem das falas. Não resuma, não acrescente informação e não comente: devolva somente a tradução.\n\n"""${chunk}"""`,
      response_json_schema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] },
    });
    out.push(String(res?.text || "").trim() || chunk);
  }
  return out.join("\n");
}

export async function transcribeWithProvider(cfg, sdb, fileUri, mimeType, language) {
  const url = await signedUrlFor(sdb, fileUri);
  if (cfg.provider === "openai") return openai(cfg, url, mimeType, language);
  if (cfg.provider === "google") return google(cfg, url, mimeType, language);
  if (cfg.provider === "assemblyai") return assemblyai(cfg, url, language);
  fail("Provedor de transcrição não suportado");
}