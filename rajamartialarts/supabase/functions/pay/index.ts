// Raja's Martial Arts — payments API (Supabase Edge Function "pay").
//   POST /pay/api                    JSON {action: config|link|start|receipt-url|receipt-confirm|status|recheck}
//   GET|POST /pay/callback/<gateway> where a payment gateway sends the customer back
// Secrets (merchant keys, service role) exist only in this server environment. Nothing here trusts the browser:
// amounts come from the server's price list, and a payment becomes successful only through settle() / bank_review.

import { createClient } from "npm:@supabase/supabase-js@2";
import { GATEWAYS, easypaisa, jazzcash } from "./gateways.ts";
import {
  HttpError, KINDS, METHODS, RECEIPT_MAX_BYTES, RECEIPT_MIME, REFERENCE_RE, cleanName, cleanPhone, digits, extFor,
  json, magicMatches, makeReference, monthToPeriod, corsHeaders, type Kind, type Method, type PaymentRow,
} from "./lib.ts";
import { settle, type Rpc } from "./settle.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const sb = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false, autoRefreshToken: false } });
const rpc: Rpc = (name, args) => sb.rpc(name, args) as unknown as ReturnType<Rpc>;
const MODE = () => (Deno.env.get("PAYMENTS_MODE") ?? "sandbox");
const SITE_URL = () => (Deno.env.get("SITE_URL") ?? "").replace(/\/$/, "");

// ---------------------------------------------------------------------------------------------- helpers
async function readJson(req: Request): Promise<Record<string, unknown>> {
  const text = await req.text();
  if (text.length > 20000) throw new HttpError(413, "Request too large");
  try { const v = JSON.parse(text || "{}"); return v && typeof v === "object" ? v as Record<string, unknown> : {}; }
  catch { throw new HttpError(400, "Invalid JSON"); }
}
async function settings() {
  const { data, error } = await sb.from("payment_settings").select("*").eq("id", 1).single();
  if (error || !data) throw new HttpError(500, "Payment settings are not available");
  return data as Record<string, unknown> & { prices: Record<string, number> };
}
const bankReady = (s: Record<string, unknown>) => !!(s.bank_name && s.account_title && (s.iban || s.account_number));
function ref(v: unknown): string { const r = String(v ?? ""); if (!REFERENCE_RE.test(r)) throw new HttpError(400, "Invalid reference"); return r; }
async function getPayment(reference: string): Promise<PaymentRow> {
  const { data } = await sb.from("payments").select("*").eq("reference", reference).maybeSingle();
  if (!data) throw new HttpError(404, "Payment not found");
  return data as PaymentRow;
}
async function requireAdmin(req: Request): Promise<string> {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) throw new HttpError(401, "Sign in as admin");
  const { data } = await sb.auth.getUser(token);
  const email = data?.user?.email?.toLowerCase();
  if (!email) throw new HttpError(401, "Sign in as admin");
  const { data: adm } = await sb.from("admins").select("email").eq("email", email).maybeSingle();
  if (!adm) throw new HttpError(403, "Not an admin");
  return email;
}

// ---------------------------------------------------------------------------------------------- actions
async function actConfig(req: Request) {
  const s = await settings();
  return json(req, {
    mode: MODE(),
    methods: { bank_transfer: bankReady(s), jazzcash: jazzcash.configured(), easypaisa: easypaisa.configured() },
    prices: s.prices,
  });
}

async function actLink(req: Request, b: Record<string, unknown>) {
  const token = String(b.token ?? "");
  if (!/^[a-f0-9]{64}$/.test(token)) return json(req, { valid: false });
  const { data } = await sb.from("payment_links").select("kind, period, amount, note, status, expires_at, students(full_name)").eq("token", token).maybeSingle();
  if (!data || data.status !== "open" || new Date(data.expires_at as string) < new Date()) return json(req, { valid: false });
  const full = (data.students as { full_name?: string } | null)?.full_name ?? "";
  return json(req, { valid: true, kind: data.kind, period: data.period, amount: data.amount, note: data.note, first_name: full.split(" ")[0] ?? "" });
}

async function actStart(req: Request, b: Record<string, unknown>) {
  const method = String(b.method ?? "") as Method;
  if (!METHODS.includes(method)) throw new HttpError(400, "Choose a payment method");
  const s = await settings();
  const gw = method === "bank_transfer" ? null : GATEWAYS[method];
  if (method === "bank_transfer" ? !bankReady(s) : !gw!.configured()) throw new HttpError(400, "This payment method is not available yet");

  let kind: Kind, amount: number, period: string | null = null, studentId: string | null = null, linkId: string | null = null;
  let name = cleanName(b.name), phone = cleanPhone(b.phone);

  if (b.link) {                                       // an admin-created link fixes student, what and how much
    const token = String(b.link);
    if (!/^[a-f0-9]{64}$/.test(token)) throw new HttpError(400, "This payment link is not valid");
    const { data: l } = await sb.from("payment_links").select("*, students(full_name, phone)").eq("token", token).maybeSingle();
    if (!l || l.status !== "open" || new Date(l.expires_at) < new Date()) throw new HttpError(400, "This payment link is no longer valid");
    kind = l.kind; amount = l.amount; period = l.period; studentId = l.student_id; linkId = l.id;
    const st = l.students as { full_name?: string; phone?: string } | null;
    name = name ?? cleanName(st?.full_name); phone = phone ?? cleanPhone(st?.phone);
  } else {
    kind = String(b.kind ?? "") as Kind;
    if (!KINDS.includes(kind)) throw new HttpError(400, "Choose what you are paying for");
    amount = Number(s.prices?.[kind]);                // the price list on the server, never a number from the browser
    if (!Number.isInteger(amount) || amount <= 0) throw new HttpError(400, "No price is set for this item yet");
    if (kind === "monthly" || kind === "family") { period = monthToPeriod(b.month); if (!period) throw new HttpError(400, "Choose the month you are paying for"); }
  }
  if (!name) throw new HttpError(400, "Enter the student's full name");
  if (!phone) throw new HttpError(400, "Enter a valid phone number");

  // light abuse protection
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count: mine } = await sb.from("payments").select("id", { count: "exact", head: true }).eq("payer_phone", phone).gte("created_at", since);
  if ((mine ?? 0) >= 8) throw new HttpError(429, "Too many attempts. Please wait a while or message us on WhatsApp.");
  const { count: all } = await sb.from("payments").select("id", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 600_000).toISOString());
  if ((all ?? 0) >= 300) throw new HttpError(429, "Busy right now. Please try again in a few minutes.");

  if (!studentId) {                                   // match a student only when exactly one has this phone number
    const { data: studs } = await sb.from("students").select("id, phone").eq("status", "active").not("phone", "is", null).limit(1000);
    const want = digits(phone).slice(-10);
    const hit = (studs ?? []).filter((x) => want.length >= 7 && digits(x.phone).slice(-10) === want);
    if (hit.length === 1) studentId = hit[0].id;
  }

  let row: PaymentRow | null = null;
  for (let i = 0; i < 4 && !row; i++) {
    const { data, error } = await sb.from("payments").insert({
      reference: makeReference(), method, kind, period, amount, student_id: studentId, link_id: linkId,
      payer_name: name, payer_phone: phone, stage: method === "bank_transfer" ? "awaiting_receipt" : "created",
    }).select("*").single();
    if (!error) row = data as PaymentRow; else if (error.code !== "23505") throw new HttpError(500, "Could not start the payment");
  }
  if (!row) throw new HttpError(500, "Could not start the payment");
  await sb.from("payment_events").insert({ payment_id: row.id, actor: "customer", event: "created", detail: { method, kind, amount } });

  if (method === "bank_transfer") {
    return json(req, {
      reference: row.reference, method, kind, period, amount, expires_at: row.expires_at,
      bank: { bank_name: s.bank_name, account_title: s.account_title, iban: s.iban, account_number: s.account_number, branch: s.branch },
      instructions: s.instructions ?? null,
    });
  }
  const returnUrl = `${SUPABASE_URL}/functions/v1/pay/callback/${method}`;
  const checkout = await gw!.buildCheckout(row, returnUrl);
  await sb.from("payments").update({ stage: "redirected", updated_at: new Date().toISOString() }).eq("id", row.id);
  return json(req, { reference: row.reference, method, kind, period, amount, checkout });
}

async function actReceiptUrl(req: Request, b: Record<string, unknown>) {
  const reference = ref(b.reference);
  const p = await getPayment(reference);
  if (p.method !== "bank_transfer" || p.status !== "pending") throw new HttpError(409, "This payment can no longer take a receipt");
  const mime = String(b.mime ?? ""), size = Number(b.size ?? 0);
  if (!(RECEIPT_MIME as readonly string[]).includes(mime)) throw new HttpError(400, "Upload a JPG, PNG, WebP image or a PDF");
  if (!(size > 0 && size <= RECEIPT_MAX_BYTES)) throw new HttpError(400, "The file must be smaller than 5 MB");
  const path = `${reference}/${crypto.randomUUID()}.${extFor(mime)}`;
  const { data, error } = await sb.storage.from("receipts").createSignedUploadUrl(path);
  if (error || !data) throw new HttpError(500, "Could not prepare the upload");
  return json(req, { path, token: data.token, signedUrl: data.signedUrl });
}

async function actReceiptConfirm(req: Request, b: Record<string, unknown>) {
  const reference = ref(b.reference);
  const path = String(b.path ?? "");
  const m = new RegExp(`^${reference}/[0-9a-f-]{36}\\.(jpg|png|webp|pdf)$`).exec(path);
  if (!m) throw new HttpError(400, "Invalid file");
  const mime = ({ jpg: "image/jpeg", png: "image/png", webp: "image/webp", pdf: "application/pdf" } as Record<string, string>)[m[1]];
  const { data: blob, error } = await sb.storage.from("receipts").download(path);
  if (error || !blob) throw new HttpError(400, "We could not find the uploaded file. Please try again.");
  if (blob.size > RECEIPT_MAX_BYTES) { await sb.storage.from("receipts").remove([path]); throw new HttpError(400, "The file must be smaller than 5 MB"); }
  const head = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
  if (!magicMatches(mime, head)) { await sb.storage.from("receipts").remove([path]); throw new HttpError(400, "That file is not a real image or PDF"); }
  const sender = String(b.sender ?? "").slice(0, 120), payerRef = String(b.payer_ref ?? "").slice(0, 80);
  const { data, error: e2 } = await rpc("pay_bank_submit", { p_reference: reference, p_path: path, p_mime: mime, p_sender: sender, p_payer_ref: payerRef });
  if (e2) throw new HttpError(500, "Could not save the receipt");
  if (data !== "ok") throw new HttpError(409, data === "expired" ? "This payment has expired. Please start again." : "This payment can no longer take a receipt");
  return json(req, { ok: true, status: "pending", stage: "receipt_submitted" });
}

async function actStatus(req: Request, b: Record<string, unknown>) {
  const p = await getPayment(ref(b.reference));
  const out: Record<string, unknown> = {   // minimal on purpose: no names, phones, files or gateway data
    reference: p.reference, status: p.status, stage: p.stage, method: p.method, kind: p.kind, period: p.period, amount: p.amount,
    receipt_submitted: !!p.receipt_path, failure_reason: p.status === "failed" ? (p as unknown as { failure_reason?: string }).failure_reason ?? null : null,
  };
  if (p.method === "bank_transfer" && p.status === "pending") {   // lets a payer come back later to upload the receipt
    const s = await settings();
    out.bank = { bank_name: s.bank_name, account_title: s.account_title, iban: s.iban, account_number: s.account_number, branch: s.branch };
    out.instructions = s.instructions ?? null; out.expires_at = p.expires_at;
  }
  return json(req, out);
}

async function actRecheck(req: Request, b: Record<string, unknown>) {
  await requireAdmin(req);
  await rpc("pay_expire_stale", {});
  let q = sb.from("payments").select("*").eq("status", "pending").in("method", ["jazzcash", "easypaisa"])
    .gte("created_at", new Date(Date.now() - 3 * 86400_000).toISOString()).limit(100);
  if (b.reference) q = q.eq("reference", ref(b.reference));
  const { data } = await q;
  const results: Record<string, string> = {};
  for (const p of (data ?? []) as PaymentRow[]) {
    const gw = GATEWAYS[p.method]; if (!gw || !gw.configured()) { results[p.reference] = "gateway not configured"; continue; }
    results[p.reference] = await settle(rpc, gw, p);
  }
  return json(req, { checked: Object.keys(results).length, results });
}

async function api(req: Request) {
  if (req.method !== "POST") throw new HttpError(405, "Use POST");
  const b = await readJson(req);
  switch (String(b.action ?? "")) {
    case "config": return actConfig(req);
    case "link": return actLink(req, b);
    case "start": return actStart(req, b);
    case "receipt-url": return actReceiptUrl(req, b);
    case "receipt-confirm": return actReceiptConfirm(req, b);
    case "status": return actStatus(req, b);
    case "recheck": return actRecheck(req, b);
    default: throw new HttpError(400, "Unknown action");
  }
}

// ---------------------------------------------------------------------------------------------- gateway callbacks
const esc = (v: string) => v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
function page(title: string, msg: string, status = 200) {
  return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>` +
    `<body style="font-family:system-ui,sans-serif;max-width:520px;margin:12vh auto;padding:0 20px;text-align:center"><h1 style="font-size:24px">${esc(title)}</h1><p>${esc(msg)}</p></body>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

async function callback(req: Request, url: URL, gwId: string) {
  const gw = GATEWAYS[gwId];
  if (!gw || !gw.configured()) return page("Not available", "This payment method is not enabled.", 404);
  const params: Record<string, string> = {};
  url.searchParams.forEach((v, k) => { params[k] = v; });
  if (req.method === "POST") {
    const ct = req.headers.get("content-type") ?? "";
    if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
      const fd = await req.formData(); fd.forEach((v, k) => { if (typeof v === "string") params[k] = v; });
    }
  }
  const v = await gw.verifyReturn(params);
  if (!v.valid || !v.reference || !REFERENCE_RE.test(v.reference)) {
    console.error("callback with invalid signature", gwId);
    return page("We could not confirm this payment", "The payment details could not be verified. If money was taken, send us a WhatsApp message with your transaction details.", 400);
  }
  const { data: p } = await sb.from("payments").select("*").eq("reference", v.reference).eq("method", gwId).maybeSingle();
  if (!p) return page("Payment not found", "We could not find this payment.", 404);
  const outcome = await settle(rpc, gw, p as PaymentRow, v.reportedFailure);   // asks the gateway directly; the return itself proves nothing
  const site = SITE_URL();
  if (site) return Response.redirect(`${site}/pay-result.html?ref=${encodeURIComponent(v.reference)}`, 303);
  const msg = outcome === "successful" ? "Thank you. Your payment was confirmed." : outcome === "failed" ? "The payment did not go through." : "Your payment is being confirmed. You can close this page.";
  return page("Payment " + outcome, msg + " Reference: " + v.reference);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/(functions\/v1\/)?pay/, "") || "/";
    if (path.startsWith("/callback/")) return await callback(req, url, path.slice("/callback/".length).replace(/\/$/, ""));
    if (path === "/api" || path === "/") return await api(req);
    return json(req, { error: "Not found" }, 404);
  } catch (e) {
    if (e instanceof HttpError) return json(req, { error: e.message }, e.status);
    console.error("unhandled", String(e).slice(0, 300));
    return json(req, { error: "Something went wrong. Please try again." }, 500);
  }
});
