"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";

export type JoinState = { status: "idle" | "ok" | "already" | "error"; message?: string };

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function joinWaitlist(_prev: JoinState, form: FormData): Promise<JoinState> {
  // Honeypot: real people never fill this hidden field.
  if (String(form.get("website") ?? "").trim()) return { status: "ok" };

  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  const consent = form.get("consent") === "on";

  if (!name) return { status: "error", message: "Escribe tu nombre." };
  if (!EMAIL.test(email)) return { status: "error", message: "Revisa tu correo." };
  if (!consent) return { status: "error", message: "Necesitamos que aceptes el aviso de privacidad." };

  const supabase = getSupabase();
  if (!supabase) return { status: "error", message: "La lista aún no está conectada. Intenta más tarde." };

  const { error } = await supabase.from("waitlist").insert({ name, email, source: "landing" });
  if (error) {
    if (error.code === "23505") return { status: "already" };
    console.error("waitlist insert failed", error.code, error.message);
    return { status: "error", message: "Algo falló. Intenta de nuevo en un momento." };
  }
  revalidatePath("/");
  return { status: "ok" };
}
