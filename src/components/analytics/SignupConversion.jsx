import { useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";

// Conversão de cadastro no Google Ads: dispara no primeiro render autenticado de um usuário novo.
const SEND_TO = "AW-18599761113/E3z9CJvk6MAdENmph6VF";

export default function SignupConversion() {
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined" || !user || !user.id) return;
    // cadastro novo, não um login recorrente: created_date dentro da janela de OTP/reenvio
    const createdDate = String(user.created_date || "");
    const createdDateUtc = /(?:Z|[+-]\d{2}:?\d{2})$/.test(createdDate) ? createdDate : createdDate + "Z";
    const createdAtMs = Date.parse(createdDateUtc);
    const isNewSignup = Number.isFinite(createdAtMs) && Date.now() - createdAtMs < 24 * 60 * 60 * 1000;
    const key = "_aw_signup_fired_" + SEND_TO + "_" + user.id;
    if (!isNewSignup || localStorage.getItem(key)) return;
    // o gtag pode ainda não existir; tenta por alguns instantes em vez de perder o evento
    let tries = 0;
    const fire = () => {
      if (!window.gtag) {
        if (tries++ < 20) setTimeout(fire, 250);
        return;
      }
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
      window.gtag("event", "conversion", { send_to: SEND_TO, transaction_id: user.id });
    };
    fire();
  }, [user]);

  return null;
}