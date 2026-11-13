import type { RevealCard } from "@/components/PackReveal";

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

/** Simulated pack for demos: commons first, maybe one hit at the back (~1 in 3). Not real odds. */
export function samplePack(cards: RevealCard[], size = 10): RevealCard[] {
  const hits = cards.filter((c) => c.is_hit);
  const rest = cards.filter((c) => !c.is_hit);
  if (!rest.length) return [];
  const out = Array.from({ length: size - 1 }, () => pick(rest));
  out.push(hits.length && Math.random() < 0.34 ? pick(hits) : pick(rest));
  return out;
}

/** Placeholder pack (our own art, no official images) for when the catalog is empty. */
export const SAMPLE_CARDS: RevealCard[] = [
  ...["Común", "Común", "Común", "Común", "Poco común", "Poco común", "Poco común"].map((r, i) => ({ name: `Carta ${i + 1}`, rarity: r, image_url: null, is_hit: false })),
  { name: "Reverse holo", rarity: "Reverse Holo", image_url: null, is_hit: false },
  { name: "Rara", rarity: "Rare", image_url: null, is_hit: false },
  { name: "Ilustración especial", rarity: "Special Illustration Rare", image_url: null, is_hit: true },
];
