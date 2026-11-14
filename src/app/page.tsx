import Link from "next/link";
import RipPanel, { PackArt } from "@/components/RipPanel";
import SiteHeader from "@/components/SiteHeader";
import WaitlistForm from "@/components/WaitlistForm";
import { LogoIcon } from "@/components/brand";
import { getSupabase } from "@/lib/supabase";
import { getProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const FOUNDER_SPOTS = 50;

async function getWaitlistCount(): Promise<number | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("waitlist_count");
  return error ? null : Number(data);
}

type Pull = { alias: string; set_name: string; hits: { name: string; rarity: string | null; image_url: string | null }[] };

async function getHomeData() {
  const supabase = getSupabase();
  if (!supabase) return { feed: [] as Pull[], setName: null as string | null, today: 0 };
  const [{ data: feed }, { data: set }, { data: today }] = await Promise.all([
    supabase.rpc("wall_feed", { p_limit: 30 }),
    supabase.from("sets").select("name").eq("active", true).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.rpc("packs_today"),
  ]);
  return { feed: (feed ?? []) as Pull[], setName: (set?.name as string | undefined) ?? null, today: Number(today ?? 0) };
}

function Tick({ href, eyebrow, title, thumb }: { href: string; eyebrow: string; title: string; thumb: React.ReactNode }) {
  return (
    <Link href={href} className="tick flex w-[230px] shrink-0 items-center gap-3 rounded-2xl bg-[#1c1e2e] p-2 pr-4 text-white no-underline">
      <span className="relative flex h-[68px] w-[52px] shrink-0 items-center justify-center">{thumb}</span>
      <span className="flex min-w-0 flex-col">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#9a9db4]">{eyebrow}</span>
        <span className="truncate text-[17px] font-semibold">{title}</span>
      </span>
    </Link>
  );
}

function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" className="mt-0.5 flex-none">
      <path d="M4 10.5 L8.5 15 L16 6" fill="none" stroke="#3DE8FF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Eyebrow({ children, color }: { children: React.ReactNode; color: string }) {
  return <span className={`text-[13px] uppercase tracking-[2px] ${color}`}>{children}</span>;
}

const STEPS = [
  { n: "01", color: "text-cyan", title: "Te suscribes", body: "Pagas tu plan mensual con Mercado Pago. Cancelas cuando quieras y te avisamos 5 días antes de cada cobro." },
  { n: "02", color: "text-pink", title: "Recibes tus sobres", body: "10 sobres sellados de fábrica del set del mes, en un solo envío protegido a cualquier parte de México." },
  { n: "03", color: "text-gold", title: "Registras tus cartas", body: "Registra lo que te salió, junta Holos para fundas, toploaders y magnetics, y aparece en el muro de aperturas." },
];

const TRUST = [
  { title: "Sellados de fábrica", body: "Nunca abrimos ni pesamos sobres. Te llegan tal como salen de la caja." },
  { title: "Asignación al azar", body: "Un sistema reparte los sobres de cada caja entre los suscriptores. Nadie elige quién recibe cuál." },
  { title: "Muro público de aperturas", body: "Cada apertura registrada aparece en el muro, para que veas qué está saliendo en la comunidad." },
];

const FAQ = [
  { q: "¿Cuándo llega mi envío?", a: "Cobramos al inicio del mes y enviamos a mediados. Recibes tu guía de rastreo por correo." },
  { q: "¿Puedo cancelar?", a: "Sí, cuando quieras. Te avisamos 5 días antes de cada renovación." },
  { q: "¿Los sobres son originales?", a: "Sí. Compramos cajas selladas a tiendas establecidas y te enviamos los sobres sin abrir." },
  { q: "¿Qué son los Holos?", a: "Puntos que ganas por registrar tus cartas. Se canjean por penny sleeves, toploaders y magnetics. No se compran ni se cambian por dinero." },
  { q: "¿Puedo pagar en OXXO?", a: "La suscripción mensual es con tarjeta. Para OXXO tendremos planes prepagados." },
];

export default async function Home() {
  const [count, { feed, setName, today }, { profile }] = await Promise.all([getWaitlistCount(), getHomeData(), getProfile()]);
  const player = profile?.alias ? `@${profile.alias}` : profile ? (profile.email?.split("@")[0] ?? null) : null;
  const recentHit = feed.find((e) => e.hits?.length)?.hits[0];
  const justRipped = feed[0];
  const subscribeUrl = process.env.NEXT_PUBLIC_MP_SUBSCRIPTION_URL;
  const spotsLeft = count === null ? null : Math.max(FOUNDER_SPOTS - count, 0);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteHeader />

      <main>
        <section className="mx-auto flex max-w-[1080px] flex-col gap-7 px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <span className="welcome-badge relative flex h-[84px] w-[84px] items-center justify-center rounded-[22px] bg-[linear-gradient(145deg,#3b2f7d,#22194f)] shadow-[0_10px_30px_rgba(59,47,125,.5)]">
                <LogoIcon size={64} />
              </span>
              <span className="flex flex-col">
                <span className="text-[22px] text-[#c9cbe0] sm:text-[26px]">{player ? "Welcome back," : "Welcome,"}</span>
                <span className="poster text-[38px] leading-none sm:text-[46px]">{player ?? "New Player"}</span>
              </span>
            </div>
            <div className="-mx-4 flex w-[calc(100%+2rem)] min-w-0 gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:w-auto sm:px-0">
              <Link href="/muro" className="tick flex shrink-0 items-center gap-3 rounded-2xl bg-[#1c1e2e] px-5 py-3 text-white no-underline">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="#c9cbe0" aria-hidden="true"><rect x="2" y="6" width="14" height="12" rx="3" /><path d="M17 10.5 22 7.5v9l-5-3z" /></svg>
                <span className="flex flex-col leading-tight">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#9a9db4]">Recent</span>
                  <span className="poster text-[18px]">Highlights</span>
                </span>
              </Link>
              <Tick
                href="/muro"
                eyebrow="Recent hit"
                title={recentHit?.name ?? "Sé el primero"}
                thumb={
                  recentHit?.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={recentHit.image_url} alt="" className="h-full w-full rounded-md object-cover shadow-[0_0_0_1.5px_#ffd84f]" />
                  ) : (
                    <span className="foil h-full w-full rounded-md" />
                  )
                }
              />
              <Tick
                href={justRipped ? "/muro" : "/packs"}
                eyebrow="Just ripped"
                title={justRipped?.set_name ?? setName ?? "Pitch Black"}
                thumb={<PackArt className="w-[44px]" flap={false} label="" />}
              />
            </div>
          </div>

          <RipPanel
            todayLabel={today > 0 ? `${today} today` : count ? `${count} fundadores` : null}
            hitImage={recentHit?.image_url}
            hitName={recentHit?.name}
            setLabel={setName?.replace(/^.*?:\s*/, "") ?? "Pitch Black"}
          />
        </section>

        <section aria-label="Comparación de precios" className="border-y border-[#1e1e38] bg-panel">
          <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 px-6 py-10">
            {[
              { label: "Caja de 36 en marketplace, de un jalón", value: "$4,849", hl: false },
              { label: "Por sobre, comprando esa caja", value: "~$135", hl: false },
              { label: "Holo Club, por sobre con envío", value: "$130", hl: true },
            ].map((p) => (
              <div key={p.label} className="flex flex-col gap-1.5">
                <span className="text-sm text-[#a6a6c0]">{p.label}</span>
                <span className={`font-display text-[40px] font-bold ${p.hl ? "glow text-cyan" : "text-[#ff7aa8]"}`}>{p.value}</span>
              </div>
            ))}
          </div>
          <p className="mx-auto max-w-[1200px] px-6 pb-6 text-xs text-dim">Precios observados en México en noviembre de 2026; pueden cambiar.</p>
        </section>

        <section id="como" className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6 py-24">
          <div className="flex max-w-[640px] flex-col gap-3">
            <Eyebrow color="text-pink">Cómo funciona</Eyebrow>
            <h2 className="m-0 font-display text-[clamp(32px,4vw,48px)] leading-tight tracking-tight">Tres pasos y listo</h2>
          </div>
          <div className="stage grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
            {STEPS.map((s) => (
              <div key={s.n} className="tile flex flex-col gap-3.5 rounded-[20px] border border-line bg-card p-7">
                <span className={`font-display text-[44px] font-bold ${s.color}`}>{s.n}</span>
                <h3 className="m-0 font-display text-[22px]">{s.title}</h3>
                <p className="m-0 leading-relaxed text-mist">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="plan" className="border-y border-[#1e1e38] bg-panel">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-14 px-6 py-24">
            <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-4">
              <Eyebrow color="text-cyan">El plan</Eyebrow>
              <h2 className="m-0 font-display text-[clamp(32px,4vw,48px)] leading-tight tracking-tight">Un solo plan. Sin letras chiquitas.</h2>
              <p className="m-0 text-lg leading-relaxed text-mist">
                Arrancamos con Mega Evolution: Pitch Black en inglés. Cuando entre un set nuevo con abasto estable, el club se actualiza solo.
              </p>
            </div>
            <div className="flex min-w-0 flex-[1_1_380px] justify-center">
              <div className="foil w-full max-w-[420px] rounded-[26px] p-[2px]">
                <div className="flex flex-col gap-5 rounded-3xl bg-[#12122a] p-9">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-display text-2xl font-bold">Club 10</span>
                    <span className="rounded-full bg-gold px-3 py-1.5 text-xs font-bold text-ink">ENVÍO INCLUIDO</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-[64px] font-bold tracking-[-2px]">$1,300</span>
                    <span className="text-[#a6a6c0]">MXN al mes</span>
                  </div>
                  <ul className="m-0 flex list-none flex-col gap-3 p-0 text-[#d8d8e8]">
                    {["10 sobres sellados de fábrica", "Un envío al mes, protegido y con rastreo", "Un toploader de regalo en cada envío", "Holos por registrar tus cartas", "Cancela cuando quieras"].map((t) => (
                      <li key={t} className="flex items-start gap-2.5">
                        <Check />
                        {t}
                      </li>
                    ))}
                  </ul>
                  {subscribeUrl ? (
                    <a href={subscribeUrl} className="btn min-h-11 rounded-2xl bg-cyan px-6 py-4 text-center text-[17px] font-bold text-ink" rel="noopener">
                      Suscribirme con Mercado Pago
                    </a>
                  ) : (
                    <>
                      <a href="#fundadores" className="btn min-h-11 rounded-2xl bg-cyan px-6 py-4 text-center text-[17px] font-bold text-ink">
                        Apartar lugar de fundador
                      </a>
                      <span className="text-center text-[13px] text-dim">Las suscripciones abren pronto.</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6 py-24">
          <div className="flex max-w-[640px] flex-col gap-3">
            <Eyebrow color="text-gold">Confianza</Eyebrow>
            <h2 className="m-0 font-display text-[clamp(32px,4vw,48px)] leading-tight tracking-tight">Nadie se queda con tus hits</h2>
          </div>
          <div className="stage grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
            {TRUST.map((t) => (
              <div key={t.title} className="tile flex flex-col gap-2.5 rounded-[20px] border border-line bg-card p-7">
                <h3 className="m-0 font-display text-xl">{t.title}</h3>
                <p className="m-0 leading-relaxed text-mist">{t.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="fundadores" className="border-y border-[#1e1e38] bg-panel">
          <div className="mx-auto flex max-w-[760px] flex-col items-center gap-5 px-6 py-24 text-center">
            <Eyebrow color="text-pink">
              Socios fundadores · {spotsLeft === null ? `${FOUNDER_SPOTS} lugares` : spotsLeft > 0 ? `quedan ${spotsLeft} de ${FOUNDER_SPOTS}` : "lista de espera"}
            </Eyebrow>
            <h2 className="glow m-0 font-display text-[clamp(32px,4vw,48px)] leading-tight tracking-tight">$1,300 congelado y un sobre extra el primer mes</h2>
            <p className="m-0 text-lg leading-relaxed text-mist">Aparta tu lugar. Te avisamos antes de abrir las suscripciones.</p>
            <WaitlistForm />
          </div>
        </section>

        <section className="mx-auto flex max-w-[820px] flex-col gap-4 px-6 py-24">
          <h2 className="mb-4 font-display text-[clamp(32px,4vw,44px)] tracking-tight">Preguntas frecuentes</h2>
          {FAQ.map((f) => (
            <details key={f.q} className="rounded-2xl border border-line bg-card px-6 py-5">
              <summary className="cursor-pointer text-lg font-semibold">{f.q}</summary>
              <p className="mt-3 mb-0 leading-relaxed text-mist">{f.a}</p>
            </details>
          ))}
        </section>
      </main>

      <footer className="border-t border-[#1e1e38]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-4 px-6 py-8 text-[13px] text-dim">
          <span>
            © 2026 Holo Club · Culiacán, México · <Link href="/privacidad" className="text-mist underline">Aviso de privacidad</Link>
          </span>
          <span className="max-w-[640px]">Holo Club no está afiliado ni respaldado por The Pokémon Company. Pokémon y sus marcas pertenecen a sus respectivos dueños.</span>
        </div>
      </footer>
    </div>
  );
}
