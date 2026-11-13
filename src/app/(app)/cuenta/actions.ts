"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/supabase/server";
import { cancelPreapproval, createPreapproval, subscriptionsOpen } from "@/lib/mercadopago";
import { siteOrigin } from "@/lib/site";

export type FormState = { status: "idle" | "ok" | "error"; message?: string; data?: Record<string, unknown> };

const pgMessage = (e: { message?: string } | null) => e?.message || "Algo falló. Intenta de nuevo.";

export async function saveProfile(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase, user } = await getSessionUser();
  if (!user) return { status: "error", message: "Tu sesión expiró." };
  const val = (k: string) => {
    const v = String(form.get(k) ?? "").trim();
    return v === "" ? null : v;
  };
  const alias = val("alias");
  if (alias && !/^[A-Za-z0-9_]{3,20}$/.test(alias)) return { status: "error", message: "El alias lleva de 3 a 20 letras, números o guion bajo." };
  const cp = val("postal_code");
  if (cp && !/^[0-9]{5}$/.test(cp)) return { status: "error", message: "El código postal lleva 5 dígitos." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: val("full_name"),
      alias,
      show_on_wall: form.get("show_on_wall") === "on",
      phone: val("phone"),
      street: val("street"),
      ext_num: val("ext_num"),
      int_num: val("int_num"),
      colonia: val("colonia"),
      city: val("city"),
      state: val("state"),
      postal_code: cp,
      address_refs: val("address_refs"),
    })
    .eq("id", user.id);
  if (error) return { status: "error", message: error.code === "23505" ? "Ese alias ya está tomado." : "No pudimos guardar. Revisa los datos." };
  revalidatePath("/cuenta");
  return { status: "ok", message: "Guardado." };
}

export async function startSubscription(// eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prev: FormState): Promise<FormState> {
  if (!subscriptionsOpen()) return { status: "error", message: "Las suscripciones abren pronto. Te avisaremos por correo." };
  const { supabase, user } = await getSessionUser();
  if (!user?.email) return { status: "error", message: "Tu sesión expiró." };

  const { data: profile } = await supabase.from("profiles").select("street, postal_code").eq("id", user.id).single();
  if (!profile?.street || !profile?.postal_code) return { status: "error", message: "Primero completa tu dirección de envío en tu perfil." };

  const { data: subId, error } = await supabase.rpc("request_subscription");
  if (error || !subId) return { status: "error", message: pgMessage(error) };

  let url: string | undefined;
  try {
    const pre = await createPreapproval({ subscriptionId: subId, email: user.email, backUrl: `${siteOrigin(await headers())}/cuenta?pago=1` });
    url = pre.init_point;
  } catch (e) {
    console.error("createPreapproval", e);
  }
  if (!url) return { status: "error", message: "Mercado Pago no respondió. Intenta en unos minutos." };
  redirect(url);
}

export async function cancelSubscription(// eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prev: FormState): Promise<FormState> {
  const { supabase, user } = await getSessionUser();
  if (!user) return { status: "error", message: "Tu sesión expiró." };
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("id, mp_preapproval_id, status")
    .eq("user_id", user.id)
    .in("status", ["active", "paused", "pending"])
    .maybeSingle();
  if (!sub) return { status: "error", message: "No tienes una suscripción activa." };
  if (!sub.mp_preapproval_id) return { status: "error", message: "Escríbenos para cancelar tu suscripción." };
  try {
    await cancelPreapproval(sub.mp_preapproval_id);
  } catch (e) {
    console.error("cancelPreapproval", e);
    return { status: "error", message: "Mercado Pago no respondió. Intenta en unos minutos." };
  }
  // The webhook records the cancellation; tell the user it is in progress.
  return { status: "ok", message: "Listo. Tu suscripción se cancela y no habrá más cobros." };
}

export async function registerPack(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase, user } = await getSessionUser();
  if (!user) return { status: "error", message: "Tu sesión expiró." };
  const code = String(form.get("code") ?? "");
  let cards: string[] = [];
  try {
    cards = JSON.parse(String(form.get("cards") ?? "[]"));
  } catch {
    return { status: "error", message: "No pudimos leer tu selección." };
  }
  const { data, error } = await supabase.rpc("register_pack", { p_code: code, p_card_ids: cards });
  if (error) return { status: "error", message: pgMessage(error) };
  revalidatePath("/cuenta");
  revalidatePath("/muro");
  return { status: "ok", data: data as Record<string, unknown> };
}

export async function redeemReward(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase, user } = await getSessionUser();
  if (!user) return { status: "error", message: "Tu sesión expiró." };
  const { error } = await supabase.rpc("redeem_reward", { p_reward_id: String(form.get("reward") ?? "") });
  if (error) return { status: "error", message: pgMessage(error) };
  revalidatePath("/cuenta");
  return { status: "ok", message: "¡Canjeado! Llegará en tu próximo envío." };
}
