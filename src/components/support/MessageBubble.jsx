import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const isFailed = (toolCall) => {
  const status = toolCall.status;
  const raw = typeof toolCall.results === "string" ? toolCall.results : JSON.stringify(toolCall.results || {});
  return status === "failed" || status === "error" || /"(success|ok)":\s*false/i.test(raw) || /error|failed/i.test(raw);
};

function ToolCall({ toolCall }) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const projection = toolCall.display_projection || {};
  const failed = isFailed(toolCall);
  const running = ["pending", "running", "in_progress"].includes(toolCall.status);
  const label = projection.hide_details && projection.details_redacted
    ? running
      ? projection.active_label || t("support.thinking")
      : failed
        ? projection.error_label || t("support.ticketError")
        : projection.label || t("support.title")
    : toolCall.name;

  const pretty = (value) => {
    if (!value) return "";
    if (typeof value === "string") {
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch {
        return value;
      }
    }
    return JSON.stringify(value, null, 2);
  };

  return (
    <div className="mt-2 rounded-xl border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
      <button type="button" className="flex w-full items-center gap-2 text-left" onClick={() => setExpanded((v) => !v)} disabled={projection.hide_details && projection.details_redacted}>
        {running ? <Loader2 className="h-3 w-3 animate-spin" /> : failed ? <X className="h-3 w-3 text-destructive" /> : <Check className="h-3 w-3 text-primary" />}
        <span className="flex-1 truncate font-semibold">{label}</span>
        {!(projection.hide_details && projection.details_redacted) && <ChevronDown className={`h-3 w-3 transition ${expanded ? "rotate-180" : ""}`} />}
      </button>
      {expanded && (
        <div className="mt-2 space-y-1">
          <p className="font-semibold">{t("support.parameters")}</p>
          <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words">{pretty(toolCall.arguments_string)}</pre>
          <p className="font-semibold">{t("support.result")}</p>
          <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words">{pretty(toolCall.results)}</pre>
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${isUser ? "bg-primary text-primary-foreground" : "border bg-white text-foreground"}`}>
        {message.content && (isUser
          ? <p className="whitespace-pre-wrap">{message.content}</p>
          : (
            <div className="space-y-1.5 leading-relaxed">
              <ReactMarkdown
                components={{
                  ul: ({ children }) => <ul className="list-disc space-y-0.5 pl-4">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal space-y-0.5 pl-4">{children}</ol>,
                  strong: ({ children }) => <strong className="font-semibold text-secondary">{children}</strong>,
                  a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline">{children}</a>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ))}
        {message.tool_calls?.map((toolCall, index) => <ToolCall key={index} toolCall={toolCall} />)}
      </div>
    </div>
  );
}