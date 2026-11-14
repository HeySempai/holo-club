import SiteHeader from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteHeader />
      <main className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
