// Gateway adapters. A gateway can only do three things here:
//   1. buildCheckout  – the signed request that sends the customer to the gateway's hosted page
//   2. verifyReturn   – check that the data the customer's browser brought back is genuinely signed
//   3. inquire        – ask the gateway directly (server to server) what really happened
// Only inquire() can lead to a payment being marked successful; the browser return is only a trigger.
//
// STATUS: JazzCash is written from JazzCash's published "Page Redirection" scheme (HMAC-SHA256 secure hash)
// and every endpoint/field it depends on is configurable below. Field names and success codes MUST be
// confirmed against the official JazzCash sandbox documentation before real use — until then an
// unrecognised answer keeps the payment 'pending' (it never becomes successful by accident).
// Easypaisa is NOT implemented yet: it waits for the official Easypay documentation and sandbox credentials.

import { ctEqual, hmacSha256Hex, pktStamp, type PaymentRow } from "./lib.ts";

export type Inquiry =
  | { state: "successful"; txnId: string; amount: number; raw: unknown }
  | { state: "failed"; reason: string; raw: unknown }
  | { state: "pending"; raw: unknown };

export interface Checkout { method: "POST" | "GET"; url: string; fields: Record<string, string> }

export interface Gateway {
  id: "jazzcash" | "easypaisa";
  configured(): boolean;
  buildCheckout(p: PaymentRow, returnUrl: string): Promise<Checkout>;
  /** Signature check of what the customer's browser returned. Returns the payment reference it refers to. */
  verifyReturn(params: Record<string, string>): Promise<{ valid: boolean; reference?: string; reportedFailure?: string }>;
  inquire(p: PaymentRow): Promise<Inquiry>;
}

const env = (k: string, d = "") => Deno.env.get(k) ?? d;

// ------------------------------------------------------------------------------------------ JazzCash
/** HMAC-SHA256 over  salt&value1&value2…  (non-empty pp_/ppmpf_ fields, sorted by name), keyed with the salt. Upper-case hex. */
export async function jazzcashHash(fields: Record<string, unknown>, salt: string): Promise<string> {
  const keys = Object.keys(fields)
    .filter((k) => k !== "pp_SecureHash" && (k.startsWith("pp_") || k.startsWith("ppmpf_")) && fields[k] !== "" && fields[k] != null)
    .sort();
  const msg = [salt, ...keys.map((k) => String(fields[k]))].join("&");
  return (await hmacSha256Hex(salt, msg)).toUpperCase();
}

const SANDBOX_CHECKOUT = "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";
const SANDBOX_INQUIRY = "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/PaymentInquiry/Inquire";

export const jazzcash: Gateway = {
  id: "jazzcash",
  configured() {
    return !!(env("JAZZCASH_MERCHANT_ID") && env("JAZZCASH_PASSWORD") && env("JAZZCASH_INTEGRITY_SALT"));
  },
  async buildCheckout(p, returnUrl) {
    const live = env("PAYMENTS_MODE", "sandbox") === "live";
    if (live && !env("JAZZCASH_CHECKOUT_URL")) throw new Error("JAZZCASH_CHECKOUT_URL must be set in live mode");
    const fields: Record<string, string> = {
      pp_Version: env("JAZZCASH_VERSION", "1.1"),
      pp_TxnType: env("JAZZCASH_TXN_TYPE", ""),
      pp_Language: "EN",
      pp_MerchantID: env("JAZZCASH_MERCHANT_ID"),
      pp_SubMerchantID: "",
      pp_Password: env("JAZZCASH_PASSWORD"),
      pp_BankID: env("JAZZCASH_BANK_ID", ""),
      pp_ProductID: env("JAZZCASH_PRODUCT_ID", ""),
      pp_TxnRefNo: p.reference,
      pp_Amount: String(p.amount * 100),                 // JazzCash amounts are in paisa
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: pktStamp(),
      pp_BillReference: p.reference,
      pp_Description: `Raja's Martial Arts ${p.kind} fee`,
      pp_TxnExpiryDateTime: pktStamp(new Date(), 60),
      pp_ReturnURL: returnUrl,
    };
    fields.pp_SecureHash = await jazzcashHash(fields, env("JAZZCASH_INTEGRITY_SALT"));
    return { method: "POST", url: env("JAZZCASH_CHECKOUT_URL", SANDBOX_CHECKOUT), fields };
  },
  async verifyReturn(params) {
    const given = params.pp_SecureHash ?? "";
    if (!given || !params.pp_TxnRefNo) return { valid: false };
    const expect = await jazzcashHash(params, env("JAZZCASH_INTEGRITY_SALT"));
    const valid = ctEqual(expect, given.toUpperCase());
    return { valid, reference: valid ? params.pp_TxnRefNo : undefined,
             reportedFailure: valid && params.pp_ResponseCode !== env("JAZZCASH_OK_CODE", "000") ? (params.pp_ResponseMessage || "Declined") : undefined };
  },
  async inquire(p) {
    const body: Record<string, string> = {
      pp_TxnRefNo: p.reference, pp_MerchantID: env("JAZZCASH_MERCHANT_ID"), pp_Password: env("JAZZCASH_PASSWORD"),
    };
    body.pp_SecureHash = await jazzcashHash(body, env("JAZZCASH_INTEGRITY_SALT"));
    const res = await fetch(env("JAZZCASH_INQUIRY_URL", SANDBOX_INQUIRY), {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
    });
    const raw = await res.json().catch(() => ({}));
    return interpretJazzcashInquiry(raw as Record<string, string>, p);
  },
};

/** Strict reading of the inquiry answer. Anything we do not positively recognise stays 'pending'. */
export function interpretJazzcashInquiry(raw: Record<string, string>, p: PaymentRow): Inquiry {
  const ok = env("JAZZCASH_OK_CODE", "000");
  const doneStatus = env("JAZZCASH_DONE_STATUS", "Completed").toLowerCase();
  if (raw.pp_ResponseCode !== ok) return { state: "pending", raw };               // no clear answer yet
  const status = String(raw.pp_Status ?? "").toLowerCase();
  if (status === doneStatus) {
    const txn = raw.pp_RetreivalReferenceNo || raw.pp_RetrievalReferenceNo || "";  // JazzCash's own spelling first
    const paisa = Number(raw.pp_Amount);
    if (!txn || !Number.isFinite(paisa) || (raw.pp_TxnRefNo && raw.pp_TxnRefNo !== p.reference)) return { state: "pending", raw };
    return { state: "successful", txnId: txn, amount: Math.round(paisa / 100), raw };
  }
  if (["failed", "declined", "cancelled", "rejected"].includes(status)) return { state: "failed", reason: raw.pp_ResponseMessage || "Declined", raw };
  return { state: "pending", raw };
}

// ------------------------------------------------------------------------------------------ Easypaisa
// Not implemented: needs the official Easypay documentation (hosted checkout + transaction inquiry) and sandbox
// credentials. It reports itself as not configured, so the website never offers it and nothing can be "paid" with it.
export const easypaisa: Gateway = {
  id: "easypaisa",
  configured: () => false,
  buildCheckout: () => Promise.reject(new Error("Easypaisa is not enabled yet")),
  verifyReturn: () => Promise.resolve({ valid: false }),
  inquire: () => Promise.reject(new Error("Easypaisa is not enabled yet")),
};

export const GATEWAYS: Record<string, Gateway> = { jazzcash, easypaisa };
