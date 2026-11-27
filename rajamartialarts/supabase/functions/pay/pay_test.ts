// Run:  deno test --allow-env supabase/functions/pay/
// These tests use a LOCAL TEST DOUBLE for the gateway (a fake object in this file). They prove our rules —
// they do not prove anything about JazzCash/Easypaisa themselves; that needs their real sandbox.

import { jazzcashHash, interpretJazzcashInquiry, jazzcash, easypaisa, type Gateway, type Inquiry } from "./gateways.ts";
import { settle, type Rpc } from "./settle.ts";
import { REFERENCE_RE, cleanPhone, ctEqual, magicMatches, makeReference, monthToPeriod, pktStamp, type PaymentRow } from "./lib.ts";

function assert(c: unknown, msg = "assertion failed") { if (!c) throw new Error(msg); }
function eq<T>(a: T, b: T, msg = "") { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg} expected ${JSON.stringify(b)} got ${JSON.stringify(a)}`); }

const pay = (o: Partial<PaymentRow> = {}): PaymentRow => ({
  id: "1", reference: "RMA7K3Q9XD2MP", status: "pending", stage: "redirected", method: "jazzcash", kind: "monthly", period: "2026-12-01",
  amount: 8000, currency: "PKR", student_id: null, payer_name: "A", payer_phone: "0300", gateway_txn_id: null, receipt_path: null,
  expires_at: "2099-01-01", created_at: "2026-01-01", ...o,
});

/** A fake gateway whose server-side answer we control. */
const fakeGateway = (answer: Inquiry | "throw"): Gateway => ({
  id: "jazzcash", configured: () => true,
  buildCheckout: () => Promise.reject(new Error("unused")), verifyReturn: () => Promise.resolve({ valid: true }),
  inquire: () => answer === "throw" ? Promise.reject(new Error("network down")) : Promise.resolve(answer),
});
/** A fake database that records which functions were called. */
const fakeRpc = (reply = "ok") => { const calls: string[] = []; const rpc: Rpc = (n) => { calls.push(n); return Promise.resolve({ data: reply, error: null }); }; return { rpc, calls }; };

Deno.test("reference format is unguessable-looking and valid", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 2000; i++) { const r = makeReference(); assert(REFERENCE_RE.test(r), r); seen.add(r); }
  eq(seen.size, 2000, "all unique");
});

Deno.test("input checks", () => {
  eq(cleanPhone("0300 1234567"), "0300 1234567"); eq(cleanPhone("abc"), null); eq(cleanPhone("1"), null);
  const now = new Date("2026-11-27T00:00:00Z");
  eq(monthToPeriod("2026-12", now), "2026-12-01"); eq(monthToPeriod("2026-09", now), "2026-09-01");
  eq(monthToPeriod("2026-08", now), null, "too old"); eq(monthToPeriod("2027-02", now), "2027-02-01", "3 months ahead is the limit"); eq(monthToPeriod("2027-03", now), null, "4 months ahead is too far");
  eq(monthToPeriod("2026-13", now), null); eq(monthToPeriod("junk", now), null);
  assert(ctEqual("abc", "abc")); assert(!ctEqual("abc", "abd")); assert(!ctEqual("abc", "ab"));
  eq(pktStamp(new Date("2026-11-27T10:00:00Z")), "20261127150000", "Pakistan is UTC+5");
});

Deno.test("receipt files must really be what they claim", () => {
  assert(magicMatches("image/jpeg", new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0])));
  assert(magicMatches("application/pdf", new TextEncoder().encode("%PDF-1.7")));
  assert(!magicMatches("image/png", new TextEncoder().encode("MZ\x90\x00 an exe renamed .png")), "exe renamed to png");
  assert(!magicMatches("image/jpeg", new TextEncoder().encode("<script>alert(1)</script>")), "html as jpg");
});

Deno.test("JazzCash secure hash: order does not matter, tampering is caught, empty and non-pp fields ignored", async () => {
  const a = { pp_Amount: "800000", pp_TxnRefNo: "RMA7K3Q9XD2MP", pp_MerchantID: "M1", pp_BankID: "" };
  const b = { pp_MerchantID: "M1", pp_TxnRefNo: "RMA7K3Q9XD2MP", pp_BankID: "", pp_Amount: "800000" };
  const h = await jazzcashHash(a, "SALT");
  eq(h, await jazzcashHash(b, "SALT"), "same fields in another order");
  assert(h !== await jazzcashHash({ ...a, pp_Amount: "1" }, "SALT"), "amount tamper changes the hash");
  assert(h !== await jazzcashHash(a, "OTHER"), "different salt");
  eq(h, await jazzcashHash({ ...a, pp_SecureHash: "x", other: "y" }, "SALT"), "pp_SecureHash and non-pp fields are ignored");
  assert(/^[0-9A-F]{64}$/.test(h));
});

Deno.test("JazzCash return with a forged or missing signature is rejected", async () => {
  Deno.env.set("JAZZCASH_MERCHANT_ID", "M1"); Deno.env.set("JAZZCASH_PASSWORD", "P"); Deno.env.set("JAZZCASH_INTEGRITY_SALT", "SALT");
  const good = { pp_TxnRefNo: "RMA7K3Q9XD2MP", pp_Amount: "800000", pp_ResponseCode: "000" };
  const signed = { ...good, pp_SecureHash: await jazzcashHash(good, "SALT") };
  const ok = await jazzcash.verifyReturn(signed);
  assert(ok.valid && ok.reference === "RMA7K3Q9XD2MP", "genuine return accepted");
  assert(!(await jazzcash.verifyReturn({ ...signed, pp_Amount: "100" })).valid, "changed amount rejected");
  assert(!(await jazzcash.verifyReturn({ ...good })).valid, "no signature rejected");
  assert(!(await jazzcash.verifyReturn({ ...good, pp_SecureHash: "0".repeat(64) })).valid, "wrong signature rejected");
  const declined = { ...good, pp_ResponseCode: "124", pp_ResponseMessage: "Declined" };
  const r = await jazzcash.verifyReturn({ ...declined, pp_SecureHash: await jazzcashHash(declined, "SALT") });
  assert(r.valid && r.reportedFailure === "Declined", "signed failure is reported");
});

Deno.test("inquiry reading is strict: unknown answers stay pending, never successful", () => {
  const p = pay();
  eq(interpretJazzcashInquiry({}, p).state, "pending");
  eq(interpretJazzcashInquiry({ pp_ResponseCode: "000" }, p).state, "pending", "no status");
  eq(interpretJazzcashInquiry({ pp_ResponseCode: "000", pp_Status: "Completed", pp_Amount: "800000" }, p).state, "pending", "no transaction id");
  eq(interpretJazzcashInquiry({ pp_ResponseCode: "000", pp_Status: "Completed", pp_RetreivalReferenceNo: "R1", pp_Amount: "800000", pp_TxnRefNo: "OTHER" }, p).state, "pending", "other order's reference");
  const good = interpretJazzcashInquiry({ pp_ResponseCode: "000", pp_Status: "Completed", pp_RetreivalReferenceNo: "R1", pp_Amount: "800000", pp_TxnRefNo: p.reference }, p);
  assert(good.state === "successful" && good.amount === 8000 && good.txnId === "R1", "paisa converted to rupees");
  eq(interpretJazzcashInquiry({ pp_ResponseCode: "000", pp_Status: "Failed", pp_ResponseMessage: "x" }, p).state, "failed");
});

Deno.test("settle: success only when the gateway itself confirms", async () => {
  const f = fakeRpc();
  eq(await settle(f.rpc, fakeGateway({ state: "successful", txnId: "T1", amount: 8000, raw: {} }), pay()), "successful");
  eq(f.calls, ["pay_mark_successful"]);
});
Deno.test("settle: a return that claims failure/success changes nothing if the gateway says pending", async () => {
  const f = fakeRpc();
  eq(await settle(f.rpc, fakeGateway({ state: "pending", raw: {} }), pay()), "pending");
  eq(f.calls, [], "no database write at all");
});
Deno.test("settle: gateway unreachable → stays pending, nothing written", async () => {
  const f = fakeRpc();
  eq(await settle(f.rpc, fakeGateway("throw"), pay()), "error"); eq(f.calls, []);
});
Deno.test("settle: database refuses (wrong amount) → NOT reported successful", async () => {
  const f = fakeRpc("amount_mismatch");
  eq(await settle(f.rpc, fakeGateway({ state: "successful", txnId: "T1", amount: 1, raw: {} }), pay()), "pending");
});
Deno.test("settle: a signed browser failure plus no success at the gateway marks failed", async () => {
  const f = fakeRpc();
  eq(await settle(f.rpc, fakeGateway({ state: "pending", raw: {} }), pay(), "Declined"), "failed"); eq(f.calls, ["pay_mark_failed"]);
});
Deno.test("settle: already-successful payment is left alone (replayed callback)", async () => {
  const f = fakeRpc();
  eq(await settle(f.rpc, fakeGateway({ state: "failed", reason: "x", raw: {} }), pay({ status: "successful" })), "successful"); eq(f.calls, []);
});

Deno.test("Easypaisa is disabled until it is really implemented", () => {
  assert(!easypaisa.configured(), "must never be offered to customers yet");
});
Deno.test("JazzCash is disabled when credentials are missing", () => {
  for (const k of ["JAZZCASH_MERCHANT_ID", "JAZZCASH_PASSWORD", "JAZZCASH_INTEGRITY_SALT"]) Deno.env.delete(k);
  assert(!jazzcash.configured());
});
