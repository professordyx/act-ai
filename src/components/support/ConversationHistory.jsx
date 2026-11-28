import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";

const AGENT = "support_agent";

export default function ConversationHistory({ currentId, onSelect }) {
  const { t, locale } = useI18n();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    base44.agents
      .listConversations({ agent_name: AGENT })
      .then((list) => alive && setItems(list || []))
      .catch(() => alive && setItems([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <p className="p-4 text-sm text-muted-foreground">{t("common.loading")}</p>;
  if (!items.length) return <p className="p-4 text-sm text-muted-foreground">{t("support.noHistory")}</p>;

  return (
    <div className="flex-1 space-y-2 overflow-y-auto p-3">
      {items.map((item) => {
        const date = item.updated_date || item.created_date;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            className={`w-full rounded-xl border p-3 text-left transition hover:border-primary/40 hover:bg-muted/60 ${item.id === currentId ? "border-primary/50 bg-muted/60" : "bg-white"}`}
          >
            <p className="truncate text-sm font-semibold text-secondary">{item.metadata?.name || t("support.title")}</p>
            {date && (
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(date).toLocaleString(locale, { dateStyle: "short", timeStyle: "short" })}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}