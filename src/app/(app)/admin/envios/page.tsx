import Link from "next/link";
import ActionForm from "@/components/ActionForm";
import { Card, Field, PageTitle, btnCls, btnGhostCls, inputCls } from "@/components/ui";
import { getSessionUser } from "@/lib/supabase/server";
import { SHIP_STATUS, fmtPeriod } from "@/lib/site";
import { assignMonth, deliverShipment, shipShipment } from "../actions";

type Addr = Record<string, string | null>;

function nextPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default async function Envios({ searchParams }: { searchParams: Promise<{ periodo?: string }> }) {
  const { periodo } = await searchParams;
  const period = /^\d{4}-\d{2}$/.test(periodo ?? "") ? periodo! : nextPeriod();
  const { supabase } = await getSessionUser();
  const [{ data: shipments }, { data: redemptions }] = await Promise.all([
    supabase.from("shipments").select("*, profiles(email, alias), packs(code)").eq("period", `${period}-01`).order("created_at"),
    supabase.from("redemptions").select("shipment_id, rewards(name)").eq("status", "pending").not("shipment_id", "is", null),
  ]);

  return (
    <>
      <PageTitle eyebrow="Administración" title="Envíos del mes" />
      <Card className="flex flex-col gap-4">
        <form className="flex flex-wrap items-end gap-3" action="/admin/envios">
          <Field label="Mes"><input type="month" name="periodo" defaultValue={period} className={inputCls} /></Field>
          <button className={btnGhostCls}>Ver</button>
          <Link href={`/admin/envios/csv?periodo=${period}`} className={btnGhostCls}>Descargar CSV para paquetería</Link>
        </form>
        <ActionForm action={assignMonth} confirm={`¿Asignar sobres al azar para ${fmtPeriod(`${period}-01`)}? Solo crea envíos para quien aún no tenga.`}>
          <input type="hidden" name="period" value={period} />
          <button className={`${btnCls} self-start`}>Asignar sobres al azar para {fmtPeriod(`${period}-01`)}</button>
        </ActionForm>
      </Card>

      {!shipments?.length && <p className="m-0 text-mist">No hay envíos para este mes.</p>}
      {shipments?.map((s) => {
        const a = s.address as Addr;
        const p = s.profiles as { email: string; alias: string | null } | null;
        const extras = (redemptions ?? []).filter((r) => r.shipment_id === s.id).map((r) => (r.rewards as unknown as { name: string } | null)?.name);
        return (
          <Card key={s.id} className="flex flex-col gap-3">
            <div className="flex flex-wrap justify-between gap-2">
              <strong>{a.full_name ?? p?.email} {p?.alias && <span className="text-dim">@{p.alias}</span>}</strong>
              <span className="text-mist">{SHIP_STATUS[s.status]}{s.tracking_number && ` · ${s.carrier} ${s.tracking_number}`}</span>
            </div>
            <span className="text-sm text-mist">
              {a.street} {a.ext_num}{a.int_num && ` int. ${a.int_num}`}, {a.colonia}, {a.city}, {a.state}, CP {a.postal_code} · Tel. {a.phone ?? "—"}
              {a.refs && ` · ${a.refs}`}
            </span>
            <div className="flex flex-wrap gap-2">
              {((s.packs ?? []) as { code: string }[]).map((pk) => (
                <span key={pk.code} className="rounded-lg border border-line px-2.5 py-1 font-mono text-sm">{pk.code}</span>
              ))}
            </div>
            <span className="text-sm text-gold">Incluir: 1 toploader de regalo{extras.length ? ` + ${extras.join(", ")}` : ""}</span>
            {s.status === "preparing" && (
              <ActionForm action={shipShipment} className="flex flex-wrap items-end gap-3">
                <input type="hidden" name="id" value={s.id} />
                <Field label="Paquetería"><input name="carrier" required placeholder="DHL" className={inputCls} /></Field>
                <Field label="Guía"><input name="tracking" required className={inputCls} /></Field>
                <button className={btnCls}>Marcar enviado</button>
              </ActionForm>
            )}
            {s.status === "shipped" && (
              <ActionForm action={deliverShipment}>
                <input type="hidden" name="id" value={s.id} />
                <button className={`${btnGhostCls} self-start`}>Marcar entregado</button>
              </ActionForm>
            )}
          </Card>
        );
      })}
    </>
  );
}
