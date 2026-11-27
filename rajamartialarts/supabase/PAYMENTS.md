# Online payments — how it works and how to switch it on

Methods: **Bank transfer** (ready), **JazzCash** (built, waits for your merchant credentials and sandbox verification),
**Easypaisa** (not built yet: waits for the official Easypay documentation and sandbox credentials).

## The rules that cannot be bent
- A payment is `pending`, `successful` or `failed`. Nobody on the website can set that status.
- **Gateway payments** become successful only when our server asks the gateway directly (server to server) and the answer is
  a clear success with the same reference and the same amount. What the customer's browser brings back is only a signal to ask.
- **Bank transfers** become successful only when a signed-in admin approves them with the bank's own credit reference
  and a receipt on file. A receipt upload alone never changes the status.
- The price always comes from the server's price list (or an admin-made link). The browser never sends an amount.
- Visitors cannot read or write any payment table. Receipts live in a private bucket.
- Every change is written to `payment_events` (who, what, when).
- Successful payments are copied into the existing `fee_payments` table, so the Fees tab and reports stay correct.
  If that month was already recorded for the student, the payment is kept but no duplicate fee row is made (flagged in the history).

## Where things are
| What | Where |
|---|---|
| Database: tables, rules, the functions that change status | `supabase/migrations/20261127000000_payments.sql` (already applied to the project) |
| Server code | `supabase/functions/pay/` (deployed as the Edge Function `pay`) |
| Customer pages | `pay.html`, `pay-result.html`, `assets/js/pay.js` |
| Admin | `admin.html` → **Payments** tab (`assets/js/admin-payments.js`) |
| Secrets | Supabase → Edge Functions → Secrets. Template: `supabase/functions/pay/.env.example` |

## Switch on, step by step
1. **Create your admin login.** Supabase dashboard → Authentication → Users → Add user (email `razantariq01@gmail.com` + a password).
   Your email is already in the `admins` table; without a login account you cannot sign in to `admin.html`.
2. **Bank details.** Sign in to `admin.html` → Payments → "Bank details and prices": bank name, account title, IBAN, account number.
   Bank transfer appears to customers the moment these are saved. Check the prices too.
3. **Site address.** Set the secret `SITE_URL` (and `ALLOWED_ORIGINS`) to your real website address.
4. **JazzCash sandbox.** Set `JAZZCASH_MERCHANT_ID`, `JAZZCASH_PASSWORD`, `JAZZCASH_INTEGRITY_SALT` (and the sandbox URLs from
   JazzCash's documentation if they differ from the defaults). Keep `PAYMENTS_MODE=sandbox`.
5. Run the **sandbox checklist** below. Only then switch to live.

## Sandbox checklist (do every line before going live)
Bank transfer
- [ ] Pay page shows bank details and a reference; upload a JPG/PNG/PDF receipt → status stays **pending**.
- [ ] Upload a fake file renamed `.jpg` → refused.
- [ ] Admin → Payments shows it under "to review"; "View receipt" opens it; Approve needs the bank reference and the tick; Reject needs a reason.
- [ ] After approval the Fees tab shows the fee as paid (method bank).
JazzCash (with JazzCash's sandbox test numbers/cards)
- [ ] Successful sandbox payment → returns to the result page → shows **confirmed**; Fees tab updated.
- [ ] Declined sandbox payment → **failed**, nothing recorded.
- [ ] Close the browser right after paying → "Re-check gateway payments" in admin settles it.
- [ ] Open the callback URL with edited parameters → rejected (signature).
- [ ] Confirm against JazzCash's documentation: secure-hash field list, amount unit (paisa), the success codes
      (`pp_ResponseCode`, `pp_Status`) and the inquiry endpoint/fields. Adjust the `JAZZCASH_*` settings or `gateways.ts` where they differ.

## Not verified yet (honest list)
- JazzCash field names, response codes and the inquiry call were written from JazzCash's published scheme and need confirming in the sandbox.
  Until confirmed, an answer the code does not recognise leaves the payment **pending** (never successful).
- Easypaisa is not implemented.
- The server functions have not been called against the live gateways from this build environment (no network access there).

## Tests
- Database rules: run in the project (23 checks: visitors blocked, non-admin blocked, wrong amount, replay, duplicate transaction, approval rules).
- Server logic: `cd supabase/functions/pay && deno test --config deno.json --allow-env pay_test.ts` (14 tests, uses a local test double for the gateway).
