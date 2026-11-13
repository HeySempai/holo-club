import Link from "next/link";
import LandingDemo from "@/components/LandingDemo";
import WaitlistForm from "@/components/WaitlistForm";
import { getSupabase } from "@/lib/supabase";

export const revalidate = 60;

const FOUNDER_SPOTS = 50;

async function getWaitlistCount(): Promise<number | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("waitlist_count");
  return error ? null : Number(data);
}

type Pull = { alias: string; set_name: string; hits: { name: string; rarity: string | null; image_url: string | null }[] };

async function getRecentHits(): Promise<Pull[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.rpc("wall_feed", { p_limit: 30 });
  return ((data ?? []) as Pull[]).filter((e) => e.hits?.length).slice(0, 8);
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
  const [count, recent] = await Promise.all([getWaitlistCount(), getRecentHits()]);
  const subscribeUrl = process.env.NEXT_PUBLIC_MP_SUBSCRIPTION_URL;
  const spotsLeft = count === null ? null : Math.max(FOUNDER_SPOTS - count, 0);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5 text-white no-underline">
          <span className="foil block h-[34px] w-[34px] rounded-[10px]" aria-hidden="true" />
          <span className="font-display text-[22px] font-bold tracking-tight">Holo Club</span>
        </Link>
        <nav aria-label="Principal" className="flex flex-wrap items-center gap-6 text-[15px]">
          <a href="#como" className="text-mist hover:text-white">Cómo funciona</a>
          <a href="#plan" className="text-mist hover:text-white">Plan</a>
          <a href="#fundadores" className="text-mist hover:text-white">Fundadores</a>
          <Link href="/colecciones" className="text-mist hover:text-white">Colecciones</Link>
          <Link href="/muro" className="text-mist hover:text-white">Muro</Link>
          <Link href="/cuenta" className="text-mist hover:text-white">Mi cuenta</Link>
          <a href="#fundadores" className="btn inline-flex min-h-11 items-center rounded-full bg-cyan px-5 font-semibold text-ink">Unirme</a>
        </nav>
      </header>

      <main>
        <section className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-12 px-6 pt-12 pb-18">
          <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-6">
            <span className="self-start rounded-full border border-[#2a2a4a] px-3.5 py-2 text-[13px] uppercase tracking-[1.5px] text-[#9ef4ff]">
              Club de sobres de Pokémon TCG en inglés
            </span>
            <h1 className="glow m-0 font-display text-[clamp(40px,6vw,72px)] leading-[1.02] font-bold tracking-[-2px]">
              Sobres sellados. Precio justo. Cada mes en tu puerta.
            </h1>
            <p className="m-0 max-w-[520px] text-[19px] leading-relaxed text-mist">
              Sin revendedores, sin cajas completas y sin ir a la tienda. Te suscribes, recibes 10 sobres sellados de fábrica y registras tus cartas en la comunidad.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#plan" className="btn min-h-11 rounded-full bg-cyan px-7 py-4 text-[17px] font-semibold text-ink">Ver el plan</a>
              <a href="#fundadores" className="min-h-11 rounded-full border border-[#3a3a5c] px-7 py-4 text-[17px] font-medium text-white hover:border-cyan">
                Lugar de fundador
              </a>
            </div>
          </div>
          <div className="flex min-w-0 flex-[1_1_420px] justify-center">
            <LandingDemo />
          </div>
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

        {recent.length > 0 && (
          <section aria-label="Últimos hits del club" className="mx-auto flex max-w-[1200px] flex-col gap-4 px-6 pt-16">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="m-0 font-display text-2xl font-bold">Lo último que le salió al club</h2>
              <Link href="/muro" className="text-sm text-cyan">Ver el muro →</Link>
            </div>
            <ul className="m-0 flex list-none gap-4 overflow-x-auto p-0 pb-2">
              {recent.flatMap((e, i) =>
                e.hits.map((h, j) => (
                  <li key={`${i}-${j}`} className="hit flex w-[170px] shrink-0 flex-col gap-1 rounded-xl bg-card p-3">
                    <span className="font-display text-sm font-semibold text-gold">★ {h.name}</span>
                    <span className="text-xs text-mist">{h.rarity}</span>
                    <span className="text-xs text-dim">@{e.alias} · {e.set_name}</span>
                  </li>
                )),
              )}
            </ul>
          </section>
        )}

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
