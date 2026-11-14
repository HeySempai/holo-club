import Link from "next/link";
import { getProfile } from "@/lib/supabase/server";
import { IconPacks, LogoFull } from "./brand";

export default async function SiteHeader() {
  const { user, profile } = await getProfile();
  return (
    <header className="sticky top-0 z-40 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-4 sm:gap-8">
          <LogoFull />
          <nav aria-label="Principal" className="flex items-center gap-6">
            <Link href="/packs" className="flex items-center gap-2 text-[17px] font-semibold text-[#9a9db4] hover:text-white">
              <IconPacks />
              <span className="hidden sm:inline">Packs</span>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {profile?.is_admin && <Link href="/admin" className="hidden px-2 text-sm font-semibold text-gold sm:inline">Admin</Link>}
              <Link href="/cuenta" className="flex min-h-11 items-center gap-2 rounded-xl border border-line px-4 font-semibold text-white hover:border-b2">
                <span className="brand-grad flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-ink">
                  {(profile?.alias ?? profile?.email ?? "?").slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden sm:inline">Mi cuenta</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/entrar" className="flex min-h-11 items-center whitespace-nowrap rounded-xl border border-line px-3 font-semibold text-[#c9cbe0] hover:border-b2 hover:text-white sm:px-6">
                Log In
              </Link>
              <Link href="/entrar?nuevo=1" className="btn brand-grad flex min-h-11 items-center whitespace-nowrap rounded-xl px-3 font-bold text-ink sm:px-6">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
