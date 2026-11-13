import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { PRICE_MXN } from "./site";

const API = "https://api.mercadopago.com";

export const subscriptionsOpen = () => process.env.SUBSCRIPTIONS_OPEN === "true" && !!process.env.MP_ACCESS_TOKEN;

async function mp<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("MP_ACCESS_TOKEN no configurado");
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Mercado Pago ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export type Preapproval = { id: string; status: string; external_reference?: string; init_point?: string; payer_email?: string };

/** Creates a monthly subscription tied to our subscription id; the customer pays at init_point. */
export function createPreapproval(opts: { subscriptionId: string; email: string; backUrl: string }) {
  return mp<Preapproval>("/preapproval", {
    method: "POST",
    headers: { "X-Idempotency-Key": `sub-${opts.subscriptionId}` },
    body: JSON.stringify({
      reason: "Holo Club · Club 10",
      external_reference: opts.subscriptionId,
      payer_email: opts.email,
      back_url: opts.backUrl,
      status: "pending",
      auto_recurring: { frequency: 1, frequency_type: "months", transaction_amount: PRICE_MXN, currency_id: "MXN" },
    }),
  });
}

export const getPreapproval = (id: string) => mp<Preapproval>(`/preapproval/${encodeURIComponent(id)}`);

export const cancelPreapproval = (id: string) =>
  mp<Preapproval>(`/preapproval/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify({ status: "cancelled" }) });

export function mapStatus(mpStatus: string): "pending" | "active" | "paused" | "cancelled" {
  if (mpStatus === "authorized") return "active";
  if (mpStatus === "paused") return "paused";
  if (mpStatus === "cancelled") return "cancelled";
  return "pending";
}

/** Verifies Mercado Pago's x-signature header (HMAC-SHA256 over id, request id and timestamp). */
export function verifyWebhook(headers: Headers, dataId: string) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  const sig = headers.get("x-signature");
  const requestId = headers.get("x-request-id");
  if (!secret || !sig || !requestId) return false;
  const parts = Object.fromEntries(sig.split(",").map((p) => p.trim().split("=", 2) as [string, string]));
  if (!parts.ts || !parts.v1) return false;
  const id = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
  const manifest = `id:${id};request-id:${requestId};ts:${parts.ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1);
  return a.length === b.length && timingSafeEqual(a, b);
}
