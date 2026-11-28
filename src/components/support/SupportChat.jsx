import { useEffect, useRef, useState } from "react";
import { ArrowLeft, History, Loader2, Plus, Send, UserRound } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import MessageBubble from "./MessageBubble";
import ConversationHistory from "./ConversationHistory";
import HandoffForm from "./HandoffForm";

const AGENT = "support_agent";

export default function SupportChat() {
  const { t } = useI18n();
  const [view, setView] = useState("chat");
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await base44.agents.listConversations({ agent_name: AGENT });
        const latest = (list || [])[0];
        if (latest && alive) {
          const full = await base44.agents.getConversation(latest.id);
          if (!alive) return;
          setConversation(full);
          setMessages(full.messages || []);
        }
      } catch {
        if (alive) setError(t("support.loadError"));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      const next = data?.messages || [];
      setMessages(next);
      const last = next[next.length - 1];
      if (last && last.role !== "user") setSending(false);
    });
    return () => unsubscribe();
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setError("");
    setSending(true);
    setInput("");
    try {
      let current = conversation;
      if (!current) {
        current = await base44.agents.createConversation({
          agent_name: AGENT,
          metadata: { name: content.slice(0, 60), description: t("support.subtitle") },
        });
        setConversation(current);
      }
      setMessages((prev) => [...prev, { role: "user", content }]);
      await base44.agents.addMessage(current, { role: "user", content });
    } catch {
      setError(t("support.sendError"));
      setSending(false);
    }
  };

  const selectConversation = async (item) => {
    setView("chat");
    setLoading(true);
    try {
      const full = await base44.agents.getConversation(item.id);
      setConversation(full);
      setMessages(full.messages || []);
    } catch {
      setError(t("support.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const startNew = () => {
    setConversation(null);
    setMessages([]);
    setError("");
    setView("chat");
  };

  if (view === "history") {
    return (
      <>
        <Toolbar onBack={() => setView("chat")} onNew={startNew} onHistory={() => {}} historyDisabled />
        <ConversationHistory currentId={conversation?.id} onSelect={selectConversation} />
      </>
    );
  }

  if (view === "handoff") {
    return (
      <>
        <Toolbar onBack={() => setView("chat")} onNew={startNew} onHistory={() => setView("history")} />
        <HandoffForm messages={messages} conversationId={conversation?.id} onCancel={() => setView("chat")} />
      </>
    );
  }

  return (
    <>
      <Toolbar onNew={startNew} onHistory={() => setView("history")} />
      <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-3">
        {loading && <p className="py-6 text-center text-sm text-muted-foreground">{t("common.loading")}</p>}
        {!loading && !messages.length && (
          <div className="space-y-3">
            <div className="rounded-2xl border bg-white p-3 text-sm text-foreground">{t("support.welcome")}</div>
            <div className="flex flex-col items-start gap-2">
              {["support.suggest1", "support.suggest2", "support.suggest3"].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => send(t(key))}
                  className="rounded-full border bg-white px-3 py-1.5 text-xs font-semibold text-secondary transition hover:border-primary/40 hover:text-primary"
                >
                  {t(key)}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message, index) => <MessageBubble key={index} message={message} />)}
        {sending && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> {t("support.thinking")}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t bg-white p-2.5">
        {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
        <form
          className="flex items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={t("support.placeholder")}
            className="max-h-24 flex-1 resize-none rounded-xl border border-input px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <Button type="submit" size="icon" className="rounded-full" disabled={sending || !input.trim()} aria-label={t("support.send")}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <button type="button" onClick={() => setView("handoff")} className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
          <UserRound className="h-3 w-3" /> {t("support.human")}
        </button>
      </div>
    </>
  );
}

function Toolbar({ onBack, onNew, onHistory, historyDisabled }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-1 border-b bg-white px-2 py-1.5">
      {onBack && (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack} aria-label={t("support.back")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={onNew}>
        <Plus className="h-3.5 w-3.5" /> {t("support.newChat")}
      </Button>
      <Button variant="ghost" size="sm" className="ml-auto h-8 gap-1.5 text-xs" onClick={onHistory} disabled={historyDisabled}>
        <History className="h-3.5 w-3.5" /> {t("support.history")}
      </Button>
    </div>
  );
}