import Link from "next/link";
import { Logo } from "@/components/ui";
import { getProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getProfile();
  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="border-b border-[#1e1e38]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Logo />
          <nav aria-label="Principal" className="flex flex-wrap items-center gap-5 text-[15px]">
            <Link href="/colecciones" className="text-mist hover:text-white">Colecciones</Link>
            <Link href="/muro" className="text-mist hover:text-white">Muro</Link>
            {user ? (
              <>
                <Link href="/cuenta" className="text-mist hover:text-white">Mi cuenta</Link>
                {profile?.is_admin && (
                  <Link href="/admin" className="text-gold hover:text-white">Admin</Link>
                )}
                <form action="/salir" method="post">
                  <button className="cursor-pointer text-mist hover:text-white">Salir</button>
                </form>
              </>
            ) : (
              <Link href="/entrar" className="btn inline-flex min-h-11 items-center rounded-full bg-cyan px-5 font-semibold text-ink">Entrar</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 py-10">{children}</main>
    </div>
  );
}
