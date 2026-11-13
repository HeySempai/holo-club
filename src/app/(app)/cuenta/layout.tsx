import Link from "next/link";

const TABS = [
  ["/cuenta", "Resumen"],
  ["/cuenta/registrar", "Registrar sobre"],
  ["/cuenta/coleccion", "Colección"],
  ["/cuenta/recompensas", "Recompensas"],
  ["/cuenta/perfil", "Perfil"],
] as const;

export default function CuentaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav aria-label="Mi cuenta" className="-mb-2 flex gap-2 overflow-x-auto pb-1">
        {TABS.map(([href, label]) => (
          <Link key={href} href={href} className="whitespace-nowrap rounded-full border border-line px-4 py-2 text-sm text-mist hover:border-cyan hover:text-white">
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </>
  );
}
