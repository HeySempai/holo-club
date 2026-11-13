import type { Metadata } from "next";
import Link from "next/link";
import ActionForm from "@/components/ActionForm";
import { Card, Notice, PageTitle, Stat, btnCls, btnGhostCls } from "@/components/ui";
import { getProfile } from "@/lib/supabase/server";
import { subscriptionsOpen } from "@/lib/mercadopago";
import { PRICE_MXN, SHIP_STATUS, SUB_STATUS, fmtDate, fmtPeriod, levelFor } from "@/lib/site";
import { cancelSubscription, startSubscription } from "./actions";

export const metadata: Metadata = { title: "Mi cuenta · Holo Club" };

export default async function Cuenta({ searchParams }: { searchParams: Promise<{ pago?: string }> }) {
  const { pago } = await searchParams;
  const { supabase, user, profile } = await getProfile();
  if (!user || !profile) return null;

  const [{ data: sub }, { data: shipments }, { data: balance }, { count: cardCount }] = await Promise.all([
    supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase
      .from("shipments")
      .select("id, period, status, carrier, tracking_number, shipped_at, packs(code, registered_at)")
      .eq("user_id", user.id)
      .order("period", { ascending: false })
      .limit(6),
    supabase.rpc("holo_balance"),
    supabase.from("pulls").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "ok"),
  ]);

  const cards = cardCount ?? 0;
  const { current, next } = levelFor(cards);
  const hasAddress = !!(profile.street && profile.postal_code);
  const live = sub && sub.status !== "cancelled";
  const open = subscriptionsOpen();

  return (
    <>
      <PageTitle eyebrow="Mi cuenta" title={`Hola${profile.alias ? `, ${profile.alias}` : ""}`} />

      {pago && <Notice kind="info">Si completaste el pago, tu suscripción se activa en unos minutos.</Notice>}
      {!hasAddress && (
        <Notice kind="info">
          Completa tu <Link href="/cuenta/perfil" className="text-cyan underline">dirección de envío y alias</Link> para recibir sobres y salir en el muro.
        </Notice>
      )}

      <div className="grid gap-5 md:grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
        <Card className="flex flex-col gap-4">
          <span className="text-sm text-[#a6a6c0]">Suscripción</span>
          {live ? (
            <>
              <span className="font-display text-2xl font-bold">{SUB_STATUS[sub.status]}</span>
              <span className="text-mist">
                Club 10 · ${(sub.price_cents / 100).toLocaleString("es-MX")} al mes{sub.founder ? " · Fundador" : ""}
              </span>
              {sub.status === "active" && sub.mp_preapproval_id && (
                <ActionForm action={cancelSubscription} confirm="¿Seguro que quieres cancelar? No habrá más cobros ni envíos.">
                  <button className={btnGhostCls}>Cancelar suscripción</button>
                </ActionForm>
              )}
            </>
          ) : (
            <>
              <span className="font-display text-2xl font-bold">Sin suscripción</span>
              <span className="text-mist">Club 10 · ${PRICE_MXN.toLocaleString("es-MX")} al mes, envío incluido.</span>
              {open ? (
                <ActionForm action={startSubscription}>
                  <button className={btnCls} disabled={!hasAddress}>Suscribirme con Mercado Pago</button>
                </ActionForm>
              ) : (
                <span className="text-sm text-dim">Las suscripciones abren pronto. Te avisaremos por correo.</span>
              )}
            </>
          )}
        </Card>

        <Card className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-8">
            <Stat label="Holos" value={balance ?? 0} accent="text-gold" />
            <Stat label="Cartas registradas" value={cards} accent="text-cyan" />
          </div>
          <span className="text-mist">
            Nivel <strong className="text-white">{current.name}</strong>
            {next && ` · te faltan ${next.min - cards} cartas para ${next.name}`}
          </span>
          <div className="flex flex-wrap gap-3">
            <Link href="/cuenta/recompensas" className={btnGhostCls}>Canjear Holos</Link>
            <Link href="/cuenta/coleccion" className={btnGhostCls}>Mi colección</Link>
          </div>
        </Card>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 font-display text-2xl">Mis envíos</h2>
          <Link href="/cuenta/registrar" className={btnCls}>Registrar un sobre</Link>
        </div>
        {!shipments?.length && <p className="m-0 text-mist">Aún no tienes envíos. Cuando salga el primero, aquí verás los códigos de tus sobres.</p>}
        {shipments?.map((s) => {
          const packs = (s.packs ?? []) as { code: string; registered_at: string | null }[];
          const done = packs.filter((p) => p.registered_at).length;
          return (
            <Card key={s.id} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-display text-lg font-semibold capitalize">{fmtPeriod(s.period)}</span>
                <span className="text-sm text-mist">
                  {SHIP_STATUS[s.status]}
                  {s.tracking_number && ` · ${s.carrier ?? ""} ${s.tracking_number}`} · {done}/{packs.length} registrados
                </span>
              </div>
              {s.status !== "preparing" && (
                <div className="flex flex-wrap gap-2">
                  {packs
                    .sort((a, b) => a.code.localeCompare(b.code))
                    .map((p) =>
                      p.registered_at ? (
                        <span key={p.code} className="rounded-lg border border-line px-3 py-1.5 font-mono text-sm text-dim line-through">{p.code}</span>
                      ) : (
                        <Link key={p.code} href={`/cuenta/registrar?codigo=${p.code}`} className="rounded-lg border border-cyan px-3 py-1.5 font-mono text-sm text-[#9ef4ff]">
                          {p.code}
                        </Link>
                      ),
                    )}
                </div>
              )}
              {s.shipped_at && <span className="text-xs text-dim">Enviado el {fmtDate(s.shipped_at)}. Registra todo en 7 días para ganar 20 Holos extra.</span>}
            </Card>
          );
        })}
      </section>
    </>
  );
}
