import { Card, PageTitle, Stat } from "@/components/ui";
import { getSessionUser } from "@/lib/supabase/server";

export default async function AdminHome() {
  const { supabase } = await getSessionUser();
  const count = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;
  const [active, pending, free, review, redemptions, waitlist] = await Promise.all([
    count(supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active")),
    count(supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "pending")),
    count(supabase.from("packs").select("id", { count: "exact", head: true }).is("shipment_id", null)),
    count(supabase.from("pulls").select("id", { count: "exact", head: true }).eq("status", "review")),
    count(supabase.from("redemptions").select("id", { count: "exact", head: true }).eq("status", "pending")),
    supabase.rpc("waitlist_count").then((r) => Number(r.data ?? 0)),
  ]);
  const needed = active * 10;

  return (
    <>
      <PageTitle eyebrow="Administración" title="Resumen" />
      <Card className="flex flex-wrap gap-10">
        <Stat label="Suscriptores activos" value={active} accent="text-cyan" />
        <Stat label="Pendientes de pago" value={pending} />
        <Stat label="Lista de fundadores" value={waitlist} accent="text-pink" />
      </Card>
      <Card className="flex flex-wrap gap-10">
        <Stat label="Sobres sin asignar" value={free} accent={free < needed ? "text-[#ff7aa8]" : "text-lime"} />
        <Stat label="Necesarios este mes" value={needed} />
        <Stat label="Registros en revisión" value={review} accent="text-gold" />
        <Stat label="Canjes por surtir" value={redemptions} accent="text-gold" />
      </Card>
      <Card className="flex flex-col gap-2 text-mist">
        <h2 className="m-0 font-display text-xl text-white">Ciclo de cada mes</h2>
        <ol className="m-0 flex flex-col gap-1 pl-5">
          <li>Compra las cajas y dalas de alta en <strong className="text-white">Cajas</strong>. Imprime los códigos y pégalos en cada funda.</li>
          <li>En <strong className="text-white">Envíos</strong>, asigna el mes: el sistema reparte los sobres al azar entre los suscriptores activos.</li>
          <li>Empaca cada envío con sus códigos, el toploader de regalo y los canjes pendientes, y captura la guía.</li>
          <li>Revisa los registros dudosos y surte los canjes.</li>
        </ol>
      </Card>
    </>
  );
}
