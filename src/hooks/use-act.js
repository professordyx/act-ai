import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

// Executa uma server function, mostra feedback e atualiza as listas.
export function useAct(fn, okMessage) {
  const qc = useQueryClient();
  const { t, tServer } = useI18n();
  return useMutation({
    mutationFn: (data) => fn({ data }),
    onSuccess: (res) => {
      qc.invalidateQueries();
      if (okMessage) toast.success(okMessage);
      return res;
    },
    onError: (e) => toast.error(tServer(e?.message) || t("common.operationFailed")),
  });
}