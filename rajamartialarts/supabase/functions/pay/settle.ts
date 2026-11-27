// Turns a gateway's answer into a payment status. Pure logic with the database call injected, so it is unit-tested.
// The ONLY route to 'successful' is: the gateway itself (server to server) says so, and the database function
// pay_mark_successful agrees that reference, amount and transaction id are consistent.

import type { Gateway } from "./gateways.ts";
import type { PaymentRow } from "./lib.ts";

export type Rpc = (name: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
export type Outcome = "successful" | "failed" | "pending" | "error";

export async function settle(rpc: Rpc, gw: Gateway, p: PaymentRow, reportedFailure?: string): Promise<Outcome> {
  if (p.status === "successful") return "successful";
  let inq;
  try {
    inq = await gw.inquire(p);                       // server-to-server; nothing the browser sent is used here
  } catch (e) {
    console.error("inquiry failed", p.reference, String(e).slice(0, 200));
    return "error";                                  // gateway unreachable: stay pending, a later re-check settles it
  }
  if (inq.state === "successful") {
    const { data, error } = await rpc("pay_mark_successful", {
      p_reference: p.reference, p_gateway_txn: inq.txnId, p_amount: inq.amount, p_raw: inq.raw,
    });
    if (error) { console.error("mark successful failed", p.reference, error.message); return "error"; }
    return data === "ok" || data === "already" ? "successful" : "pending";   // amount_mismatch etc. stay pending for an admin
  }
  const failReason = inq.state === "failed" ? inq.reason : reportedFailure;       // reportedFailure comes from a *signed* return
  if (failReason) {
    const { error } = await rpc("pay_mark_failed", { p_reference: p.reference, p_reason: failReason, p_raw: inq.raw });
    if (error) return "error";
    return "failed";
  }
  return "pending";
}
