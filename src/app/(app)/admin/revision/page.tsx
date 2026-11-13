import ActionForm from "@/components/ActionForm";
import { Card, PageTitle, btnCls, btnGhostCls } from "@/components/ui";
import { getSessionUser } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/site";
import { reviewPull } from "../actions";

export default async function Revision() {
  const { supabase } = await getSessionUser();
  const { data: pulls } = await supabase
    .from("pulls")
    .select("id, created_at, cards(name, rarity, number), packs(code), profiles(email, alias)")
    .eq("status", "review")
    .order("created_at");

  return (
    <>
      <PageTitle eyebrow="Administración" title="Registros en revisión">
        Hits registrados por encima del máximo del sobre. Pide foto de la carta junto al código del sobre antes de aprobar.
      </PageTitle>
      {!pulls?.length && <p className="m-0 text-mist">Nada pendiente.</p>}
      {pulls?.map((p) => {
        const c = p.cards as unknown as { name: string; rarity: string; number: string } | null;
        const u = p.profiles as unknown as { email: string; alias: string | null } | null;
        return (
          <Card key={p.id} className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <strong className="text-gold">{c?.name} #{c?.number} · {c?.rarity}</strong>
              <span className="text-sm text-mist">{u?.alias ? `@${u.alias}` : u?.email} · sobre {(p.packs as unknown as { code: string } | null)?.code} · {fmtDate(p.created_at)}</span>
            </div>
            <div className="flex gap-2">
              <ActionForm action={reviewPull}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="approve" value="1" /><button className={btnCls}>Aprobar</button></ActionForm>
              <ActionForm action={reviewPull}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="approve" value="0" /><button className={btnGhostCls}>Rechazar</button></ActionForm>
            </div>
          </Card>
        );
      })}
    </>
  );
}
