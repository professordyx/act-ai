import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Executa uma server function, mostra feedback e atualiza as listas.
export function useAct(fn, okMessage) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => fn({ data }),
    onSuccess: (res) => {
      qc.invalidateQueries();
      if (okMessage) toast.success(okMessage);
      return res;
    },
    onError: (e) => toast.error(e?.message || "Não foi possível concluir a operação"),
  });
}