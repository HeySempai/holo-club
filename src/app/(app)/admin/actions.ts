"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/supabase/server";

type S = { status: "idle" | "ok" | "error"; message?: string };
const err = (e: { message?: string } | null): S => ({ status: "error", message: e?.message || "Algo falló." });
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

async function db() {
  const { supabase, user } = await getSessionUser();
  if (!user) throw new Error("Sesión expirada");
  return supabase;
}

export async function upsertSet(_p: S, f: FormData): Promise<S> {
  const supabase = await db();
  const rarities = str(f, "hit_rarities").split(",").map((r) => r.trim()).filter(Boolean);
  const { error } = await supabase.rpc("admin_upsert_set", {
    p_id: str(f, "id").toLowerCase(),
    p_name: str(f, "name"),
    p_cards_per_pack: Number(str(f, "cards_per_pack") || 10),
    p_max_hits: Number(str(f, "max_hits") || 2),
    p_hit_rarities: rarities.length ? rarities : null,
  });
  if (error) return err(error);
  revalidatePath("/admin/catalogo");
  return { status: "ok", message: "Set guardado." };
}

type ImportCard = { id?: string; number: string; name: string; rarity?: string | null; image_url?: string | null };

function parseCsv(text: string): ImportCard[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !/^number\s*,/i.test(l))
    .map((l) => {
      const [number, name, rarity, image_url] = l.split(",").map((x) => x?.trim());
      return { number, name, rarity: rarity ? titleCase(rarity) : null, image_url: image_url || null };
    });
}

const titleCase = (r: string) => r.replace(/\b\w/g, (c) => c.toUpperCase());

// TCGdex: free, no key, open source, usually lists new sets within days of release.
async function fetchTcgdex(setId: string): Promise<ImportCard[]> {
  const base = "https://api.tcgdex.net/v2/en";
  const res = await fetch(`${base}/sets/${encodeURIComponent(setId)}`, { cache: "no-store" });
  if (!res.ok) throw new Error(res.status === 404 ? `TCGdex no tiene el set "${setId}"` : `TCGdex respondió ${res.status}`);
  const set = (await res.json()) as { cards?: { id: string; localId: string; name: string; image?: string }[] };
  const list = set.cards ?? [];
  const out: ImportCard[] = new Array(list.length);
  let i = 0;
  // The set listing has no rarity, so fetch each card (8 at a time).
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      while (i < list.length) {
        const idx = i++;
        const c = list[idx];
        let rarity: string | null = null;
        const r = await fetch(`${base}/cards/${encodeURIComponent(c.id)}`, { cache: "no-store" });
        if (r.ok) rarity = ((await r.json()) as { rarity?: string }).rarity ?? null;
        out[idx] = { id: c.id, number: c.localId, name: c.name, rarity: rarity ? titleCase(rarity) : null, image_url: c.image ? `${c.image}/low.webp` : null };
      }
    }),
  );
  return out;
}

async function fetchPokemonTcg(apiSetId: string): Promise<ImportCard[]> {
  const out: ImportCard[] = [];
  const headers: HeadersInit = process.env.POKEMONTCG_API_KEY ? { "X-Api-Key": process.env.POKEMONTCG_API_KEY } : {};
  for (let page = 1; page <= 5; page++) {
    const url = `https://api.pokemontcg.io/v2/cards?q=set.id:${encodeURIComponent(apiSetId)}&page=${page}&pageSize=250&select=id,name,number,rarity,images`;
    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) throw new Error(`La API respondió ${res.status}`);
    const json = (await res.json()) as { data: { id: string; name: string; number: string; rarity?: string; images?: { small?: string } }[]; totalCount: number };
    out.push(...json.data.map((c) => ({ id: c.id, number: c.number, name: c.name, rarity: c.rarity ?? null, image_url: c.images?.small ?? null })));
    if (out.length >= json.totalCount || !json.data.length) break;
  }
  return out;
}

export async function importCards(_p: S, f: FormData): Promise<S> {
  const supabase = await db();
  const setId = str(f, "set_id");
  let cards: ImportCard[] = [];
  try {
    const apiId = str(f, "api_set_id");
    const source = str(f, "source") || "tcgdex";
    cards = apiId ? await (source === "pokemontcg" ? fetchPokemonTcg(apiId) : fetchTcgdex(apiId)) : parseCsv(str(f, "csv"));
  } catch (e) {
    return { status: "error", message: `No se pudo leer el catálogo: ${(e as Error).message}` };
  }
  if (!cards.length) return { status: "error", message: "No llegó ninguna carta. Revisa el ID o el texto." };
  const { data, error } = await supabase.rpc("admin_import_cards", { p_set_id: setId, p_cards: cards });
  if (error) return err(error);
  revalidatePath("/admin/catalogo");
  return { status: "ok", message: `${data} cartas importadas o actualizadas.` };
}

export async function createBox(_p: S, f: FormData): Promise<S> {
  const supabase = await db();
  const cost = Math.round(Number(str(f, "cost") || 0) * 100);
  const { error } = await supabase.rpc("admin_create_box", {
    p_set_id: str(f, "set_id"),
    p_label: str(f, "label"),
    p_supplier: str(f, "supplier") || null,
    p_cost_cents: cost,
    p_packs: Number(str(f, "packs") || 36),
  });
  if (error) return err(error);
  revalidatePath("/admin/cajas");
  return { status: "ok", message: "Caja creada con sus códigos." };
}

export async function assignMonth(_p: S, f: FormData): Promise<S> {
  const supabase = await db();
  const { data, error } = await supabase.rpc("admin_assign_month", { p_period: `${str(f, "period")}-01` });
  if (error) return err(error);
  const r = data as { shipments: number; packs: number; skipped_no_address: string[] };
  revalidatePath("/admin/envios");
  const skipped = r.skipped_no_address.length ? ` Sin dirección (no se les asignó): ${r.skipped_no_address.join(", ")}.` : "";
  return { status: "ok", message: `${r.shipments} envíos creados con ${r.packs} sobres asignados al azar.${skipped}` };
}

export async function shipShipment(_p: S, f: FormData): Promise<S> {
  const supabase = await db();
  const { error } = await supabase.rpc("admin_ship", { p_shipment: str(f, "id"), p_carrier: str(f, "carrier"), p_tracking: str(f, "tracking") });
  if (error) return err(error);
  revalidatePath("/admin/envios");
  return { status: "ok", message: "Marcado como enviado." };
}

export async function deliverShipment(_p: S, f: FormData): Promise<S> {
  const supabase = await db();
  const { error } = await supabase.rpc("admin_mark_delivered", { p_shipment: str(f, "id") });
  if (error) return err(error);
  revalidatePath("/admin/envios");
  return { status: "ok", message: "Marcado como entregado." };
}

export async function reviewPull(_p: S, f: FormData): Promise<S> {
  const supabase = await db();
  const { error } = await supabase.rpc("admin_review_pull", { p_pull: str(f, "id"), p_approve: str(f, "approve") === "1" });
  if (error) return err(error);
  revalidatePath("/admin/revision");
  return { status: "ok", message: "Listo." };
}

export async function setRedemption(_p: S, f: FormData): Promise<S> {
  const supabase = await db();
  const { error } = await supabase.rpc("admin_set_redemption", { p_id: str(f, "id"), p_status: str(f, "status") });
  if (error) return err(error);
  revalidatePath("/admin/canjes");
  return { status: "ok", message: "Listo." };
}

export async function setSubscription(_p: S, f: FormData): Promise<S> {
  const supabase = await db();
  const { error } = await supabase.rpc("admin_set_subscription", {
    p_user_id: str(f, "user_id"),
    p_status: str(f, "status"),
    p_founder: f.get("founder") === "on",
  });
  if (error) return err(error);
  revalidatePath("/admin/suscriptores");
  return { status: "ok", message: "Suscripción actualizada." };
}
