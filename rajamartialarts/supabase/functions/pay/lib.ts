// Shared helpers for the payment function. Pure code: no network, no database (so it can be unit-tested).

export const KINDS = ["monthly", "family", "admission", "gi", "personal"] as const;
export type Kind = typeof KINDS[number];
export const METHODS = ["bank_transfer", "jazzcash", "easypaisa"] as const;
export type Method = typeof METHODS[number];

export interface PaymentRow {
  id: string; reference: string; status: "pending" | "successful" | "failed"; stage: string;
  method: Method; kind: Kind; period: string | null; amount: number; currency: string;
  student_id: string | null; payer_name: string | null; payer_phone: string | null;
  gateway_txn_id: string | null; receipt_path: string | null; expires_at: string; created_at: string;
}

// Reference = "RMA" + 10 letters/digits (no 0/O/1/I/L). Unguessable (~49 bits), alphanumeric (gateways want that).
const ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789"; // 30 symbols
export function makeReference(): string {
  let out = "";
  while (out.length < 10) {
    const b = crypto.getRandomValues(new Uint8Array(16));
    for (const x of b) { if (x < 240 && out.length < 10) out += ALPHABET[x % 30]; } // 240 = 8*30 → no modulo bias
  }
  return "RMA" + out;
}
export const REFERENCE_RE = /^RMA[A-HJKMNP-TV-Z2-9]{10}$/;

export function cleanName(v: unknown): string | null {
  const s = String(v ?? "").replace(/\s+/g, " ").trim();
  return s.length >= 2 && s.length <= 100 ? s : null;
}
export function cleanPhone(v: unknown): string | null {
  const s = String(v ?? "").trim();
  return /^[0-9+()\-\s]{7,30}$/.test(s) ? s : null;
}
export const digits = (v: unknown) => String(v ?? "").replace(/\D/g, "");

/** "2026-12" → "2026-12-01". Only the current month, up to 2 months back and 3 ahead are accepted. */
export function monthToPeriod(v: unknown, now = new Date()): string | null {
  const m = /^(\d{4})-(\d{2})$/.exec(String(v ?? ""));
  if (!m) return null;
  const y = +m[1], mo = +m[2];
  if (mo < 1 || mo > 12) return null;
  const diff = (y - now.getUTCFullYear()) * 12 + (mo - 1 - now.getUTCMonth());
  return diff >= -2 && diff <= 3 ? `${m[1]}-${m[2]}-01` : null;
}

export const RECEIPT_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
export const RECEIPT_MAX_BYTES = 5 * 1024 * 1024;
export const extFor = (mime: string) => ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" } as Record<string, string>)[mime] ?? "bin";

/** True when the first bytes really look like the claimed file type (a renamed .exe is not an image). */
export function magicMatches(mime: string, head: Uint8Array): boolean {
  const starts = (...b: number[]) => b.every((x, i) => head[i] === x);
  switch (mime) {
    case "image/jpeg": return starts(0xff, 0xd8, 0xff);
    case "image/png": return starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    case "image/webp": return starts(0x52, 0x49, 0x46, 0x46) && head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50;
    case "application/pdf": return starts(0x25, 0x50, 0x44, 0x46);
    default: return false;
  }
}

export function ctEqual(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  if (x.length !== y.length) return false;
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0;
}

export async function hmacSha256Hex(key: string, msg: string): Promise<string> {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, enc.encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function corsHeaders(req: Request): Record<string, string> {
  const allowed = (Deno.env.get("ALLOWED_ORIGINS") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const origin = req.headers.get("origin") ?? "";
  const allow = allowed.length === 0 ? "*" : allowed.includes(origin) ? origin : allowed[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Vary": "Origin",
  };
}
export function json(req: Request, data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status, headers: { ...corsHeaders(req), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
export class HttpError extends Error { constructor(public status: number, msg: string) { super(msg); } }

/** Pakistan time (UTC+5) as yyyyMMddHHmmss, which JazzCash expects. */
export function pktStamp(d = new Date(), addMinutes = 0): string {
  const t = new Date(d.getTime() + (5 * 60 + addMinutes) * 60000);
  const p = (n: number, l = 2) => String(n).padStart(l, "0");
  return `${t.getUTCFullYear()}${p(t.getUTCMonth() + 1)}${p(t.getUTCDate())}${p(t.getUTCHours())}${p(t.getUTCMinutes())}${p(t.getUTCSeconds())}`;
}
