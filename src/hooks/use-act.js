import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

// Executa uma server function, mostra feedback e atualiza as listas.
export function useAct(fn, okMessage, afterSuccess) {
  const qc = useQueryClient();
  const { t, tServer } = useI18n();
  return useMutation({
    mutationFn: (data) => fn({ data }),
    onSuccess: (res, data) => {
      qc.invalidateQueries();
      if (okMessage) toast.success(okMessage);
      afterSuccess?.(res, data);
      return res;
    },
    onError: (e) => toast.error(tServer(e?.message) || t("common.operationFailed")),
  });
}