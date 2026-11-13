export const PRICE_MXN = 1300;
export const PACKS_PER_MONTH = 10;

export const LEVELS = [
  { name: "Novato", min: 0 },
  { name: "Entrenador", min: 50 },
  { name: "Coleccionista", min: 200 },
  { name: "Leyenda", min: 500 },
] as const;

export function levelFor(cards: number) {
  let current: (typeof LEVELS)[number] = LEVELS[0];
  for (const l of LEVELS) if (cards >= l.min) current = l;
  const next = LEVELS.find((l) => l.min > cards) ?? null;
  return { current, next };
}

/** Only allow same-site relative redirects. */
export function safeNext(next: string | null | undefined, fallback = "/cuenta") {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export function siteOrigin(headers: Headers) {
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  const proto = headers.get("x-forwarded-proto") ?? "https";
  return process.env.NEXT_PUBLIC_SITE_URL ?? `${proto}://${host}`;
}

export const SUB_STATUS: Record<string, string> = {
  pending: "Pendiente de pago",
  active: "Activa",
  paused: "En pausa",
  cancelled: "Cancelada",
};

export const SHIP_STATUS: Record<string, string> = {
  preparing: "Preparando",
  shipped: "En camino",
  delivered: "Entregado",
};

export const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Mazatlan" }) : "—";

export const fmtPeriod = (d: string) =>
  new Date(d + "T12:00:00").toLocaleDateString("es-MX", { month: "long", year: "numeric" });
