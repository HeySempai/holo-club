import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";

const TABS = [
  ["/admin", "Resumen"],
  ["/admin/catalogo", "Catálogo"],
  ["/admin/cajas", "Cajas"],
  ["/admin/envios", "Envíos"],
  ["/admin/suscriptores", "Suscriptores"],
  ["/admin/revision", "Revisión"],
  ["/admin/canjes", "Canjes"],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getProfile();
  if (!profile?.is_admin) notFound();
  return (
    <>
      <nav aria-label="Administración" className="-mb-2 flex gap-2 overflow-x-auto pb-1">
        {TABS.map(([href, label]) => (
          <Link key={href} href={href} className="whitespace-nowrap rounded-full border border-[#5a4a1a] px-4 py-2 text-sm text-gold hover:border-gold">
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </>
  );
}
