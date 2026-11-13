"use server";

import { headers } from "next/headers";
import { supabaseServer } from "@/lib/supabase/server";
import { safeNext, siteOrigin } from "@/lib/site";

export type LoginState = { status: "idle" | "sent" | "error"; message?: string };

export async function sendMagicLink(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { status: "error", message: "Revisa tu correo." };
  const next = safeNext(String(form.get("next") ?? ""));
  const origin = siteOrigin(await headers());

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) {
    console.error("signInWithOtp", error.status, error.message);
    const rate = error.status === 429;
    return { status: "error", message: rate ? "Ya pediste varios enlaces. Espera unos minutos." : "No pudimos enviar el enlace. Intenta de nuevo." };
  }
  return { status: "sent" };
}
