/* Raja's Admin — Payments tab. Loaded by admin.html after it has created the Supabase client (window.RMA_SB).
   Every read and write goes through the database's own rules: only people listed in "admins" can see or change anything here,
   and a bank transfer can only become successful through the database function bank_review (admin + receipt + bank reference). */
(function () {
  "use strict";
  var C = window.RAJA || {};
  var sb = window.RMA_SB;
  var root = document.querySelector('[data-view="payments"]');
  if (!sb || !root) return;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var pkr = function (n) { return "PKR " + Number(n || 0).toLocaleString("en-PK"); };
  var when = function (s) { var d = new Date(s); return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + ", " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); };
  var monthName = function (p) { if (!p) return ""; return new Date(p + "T00:00:00").toLocaleDateString("en-GB", { month: "short", year: "numeric" }); };
  var KIND = { monthly: "Monthly fee", family: "Family fee", admission: "Admission", gi: "Gi", personal: "Personal training" };
  var METHOD = { easypaisa: "Easypaisa", jazzcash: "JazzCash", bank_transfer: "Bank transfer" };
  var API = String(C.supabaseUrl || "").replace(/\/$/, "") + "/functions/v1/pay/api";

  var S = { payments: [], students: [], links: [], settings: null, status: "", method: "", search: "", loaded: false };

  function toast(msg, err) {
    var t = document.getElementById("toast"); if (!t) return;
    t.textContent = msg; t.className = "toast" + (err ? " err" : ""); t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.hidden = true; }, 3600);
  }
  function fail(e) { console.error(e); toast((e && e.message) || "Something went wrong", true); }
  function q(p) { return p.then(function (r) { if (r.error) throw r.error; return r.data; }); }

  var st = document.createElement("style");
  st.textContent = ".b-pending{background:rgba(224,163,30,.15);border-color:rgba(224,163,30,.5);color:#f3c96b}.b-successful{background:rgba(34,163,90,.15);border-color:rgba(34,163,90,.5);color:#6fdc9d}.b-failed{background:rgba(224,30,38,.15);border-color:rgba(224,30,38,.5);color:#ff7a7f}" +
    ".pay-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;margin-top:24px}@media(max-width:900px){.pay-grid{grid-template-columns:minmax(0,1fr)}}" +
    ".card .pad{padding:16px}.linkbox{background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:10px 12px;font-size:12px;word-break:break-all;margin:8px 0}.hint{color:var(--mut);font-size:12px;margin:6px 0 0}" +
    ".warn{background:rgba(224,163,30,.12);border:1px solid rgba(224,163,30,.4);color:#f3c96b;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:13px}";
  document.head.appendChild(st);

  /* ---------- load ---------- */
  function load(silent) {
    return Promise.all([
      q(sb.from("payments").select("*, students(full_name, phone)").order("created_at", { ascending: false }).limit(500)),
      q(sb.from("students").select("id, full_name, phone, monthly_fee, status").order("full_name")),
      q(sb.from("payment_links").select("*, students(full_name)").order("created_at", { ascending: false }).limit(40)),
      q(sb.from("payment_settings").select("*").eq("id", 1).single())
    ]).then(function (r) {
      S.payments = r[0]; S.students = r[1]; S.links = r[2]; S.settings = r[3]; S.loaded = true;
      badge(); if (!silent || !root.hidden) render();
    }).catch(function (e) { if (!silent) fail(e); });
  }
  function toReview() { return S.payments.filter(function (p) { return p.method === "bank_transfer" && p.status === "pending" && p.receipt_path; }); }
  function badge() {
    var n = toReview().length, b = $("#nb-pay"); if (!b) return;
    b.textContent = n; b.hidden = !n;
  }

  /* ---------- render ---------- */
  function who(p) {
    var s = p.students;
    return "<b>" + esc(p.payer_name || (s && s.full_name) || "—") + '</b><div class="sub">' + esc(p.payer_phone || (s && s.phone) || "") + "</div>";
  }
  function forWhat(p) { return esc(KIND[p.kind] || p.kind) + (p.period ? '<div class="sub">' + esc(monthName(p.period)) + "</div>" : ""); }
  function sbadge(p) { return '<span class="badge b-' + p.status + '">' + p.status + "</span>" + (p.status !== "successful" && p.stage ? '<div class="sub">' + esc(p.stage.replace(/_/g, " ")) + "</div>" : ""); }

  function render() {
    var now = new Date(), ms = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    var rev = toReview();
    var gw = S.payments.filter(function (p) { return p.status === "pending" && p.method !== "bank_transfer"; });
    var got = S.payments.filter(function (p) { return p.status === "successful" && p.verified_at >= ms; });
    var failed = S.payments.filter(function (p) { return p.status === "failed" && p.created_at >= new Date(Date.now() - 30 * 86400000).toISOString(); });
    var cfg = S.settings || {}, bankOk = !!(cfg.bank_name && cfg.account_title && (cfg.iban || cfg.account_number));
    var list = S.payments.filter(function (p) {
      if (S.status && p.status !== S.status) return false;
      if (S.method && p.method !== S.method) return false;
      if (S.search) { var h = (p.reference + " " + (p.payer_name || "") + " " + (p.payer_phone || "") + " " + (p.students ? p.students.full_name : "")).toLowerCase(); if (h.indexOf(S.search.toLowerCase()) < 0) return false; }
      return true;
    });

    root.innerHTML =
      '<div class="head"><h2>Online <span>payments</span></h2><div class="tools"><button class="btn btn--sm" data-act="recheck">Re-check gateway payments</button><button class="btn btn--sm btn--ghost" data-act="reload">↻ Refresh</button></div></div>' +
      (bankOk ? "" : '<div class="warn">Bank transfer is <b>off</b> until you fill in the bank details below. Easypaisa and JazzCash switch on only when their merchant keys are set on the server.</div>') +
      '<div class="stats">' +
      '<div class="stat"><small>Bank transfers to review</small><b>' + rev.length + "</b><span>receipt uploaded, waiting for you</span></div>" +
      '<div class="stat"><small>Waiting for gateway</small><b>' + gw.length + "</b><span>Easypaisa / JazzCash, not confirmed yet</span></div>" +
      '<div class="stat"><small>Received this month</small><b>' + pkr(got.reduce(function (a, p) { return a + p.amount; }, 0)) + "</b><span>" + got.length + " verified payments</span></div>" +
      '<div class="stat"><small>Failed / rejected (30 days)</small><b>' + failed.length + "</b><span>no money counted</span></div></div>" +

      '<div class="card"><h3>Bank transfers to review</h3><div class="tbl"><table><thead><tr><th>Received</th><th>Payer</th><th>For</th><th>Amount</th><th>Their reference</th><th>Receipt</th><th></th></tr></thead><tbody>' +
      (rev.length ? rev.map(function (p) {
        return "<tr><td>" + esc(when(p.receipt_uploaded_at || p.created_at)) + '<div class="sub">' + esc(p.reference) + "</div></td><td>" + who(p) + "</td><td>" + forWhat(p) + "</td><td><b>" + pkr(p.amount) + "</b></td><td>" +
          esc(p.bank_payer_ref || "—") + '<div class="sub">' + esc(p.bank_sender || "") + '</div></td><td><button class="btn btn--sm" data-act="receipt" data-id="' + p.id + '">View receipt</button></td>' +
          '<td><div class="acts"><button class="btn btn--sm btn--ok" data-act="approve" data-id="' + p.id + '">Approve</button><button class="btn btn--sm btn--ghost" data-act="reject" data-id="' + p.id + '">Reject</button></div></td></tr>';
      }).join("") : '<tr><td colspan="7" class="empty">Nothing waiting. New receipts appear here.</td></tr>') + "</tbody></table></div></div>" +

      '<div class="card" style="margin-top:16px"><h3>All payments</h3><div class="pad" style="padding-bottom:0"><div class="tools">' +
      '<input id="pf-q" placeholder="Search name, phone, reference" value="' + esc(S.search) + '">' +
      '<select id="pf-s"><option value="">All statuses</option>' + ["pending", "successful", "failed"].map(function (x) { return '<option value="' + x + '"' + (S.status === x ? " selected" : "") + ">" + x + "</option>"; }).join("") + "</select>" +
      '<select id="pf-m"><option value="">All methods</option>' + Object.keys(METHOD).map(function (x) { return '<option value="' + x + '"' + (S.method === x ? " selected" : "") + ">" + METHOD[x] + "</option>"; }).join("") + "</select></div></div>" +
      '<div class="tbl"><table><thead><tr><th>Date</th><th>Payer</th><th>Student</th><th>For</th><th>Amount</th><th>Method</th><th>Status</th><th></th></tr></thead><tbody>' +
      (list.length ? list.map(function (p) {
        var stu = p.students ? "<b>" + esc(p.students.full_name) + "</b>" : '<span class="badge b-pending">unmatched</span>';
        var attach = !p.student_id && !p.fee_payment_id ? '<div class="acts" style="margin-top:6px"><select data-att="' + p.id + '" style="width:150px"><option value="">Attach to student…</option>' +
          S.students.map(function (s) { return '<option value="' + s.id + '">' + esc(s.full_name) + "</option>"; }).join("") + '</select><button class="btn btn--sm" data-act="attach" data-id="' + p.id + '">Attach</button></div>' : "";
        return "<tr><td>" + esc(when(p.created_at)) + '<div class="sub">' + esc(p.reference) + "</div></td><td>" + who(p) + "</td><td>" + stu + attach + "</td><td>" + forWhat(p) + "</td><td><b>" + pkr(p.amount) + "</b></td><td>" +
          esc(METHOD[p.method]) + '</td><td>' + sbadge(p) + (p.failure_reason ? '<div class="sub">' + esc(p.failure_reason) + "</div>" : "") + '</td><td><button class="btn btn--sm btn--ghost" data-act="events" data-id="' + p.id + '">History</button></td></tr>';
      }).join("") : '<tr><td colspan="8" class="empty">No payments yet.</td></tr>') + "</tbody></table></div></div>" +

      '<div class="pay-grid"><div class="card"><h3>Send a payment link</h3><div class="pad"><form id="lk-form">' +
      '<div class="field"><label>Student</label><select name="student_id" required><option value="">Choose…</option>' + S.students.filter(function (s) { return s.status !== "left"; }).map(function (s) { return '<option value="' + s.id + '">' + esc(s.full_name) + "</option>"; }).join("") + "</select></div>" +
      '<div class="row"><div class="field"><label>For</label><select name="kind">' + Object.keys(KIND).map(function (k) { return '<option value="' + k + '">' + KIND[k] + "</option>"; }).join("") + '</select></div><div class="field"><label>Month (monthly fee)</label><input name="month" type="month" value="' + new Date().toISOString().slice(0, 7) + '"></div></div>' +
      '<div class="row"><div class="field"><label>Amount (PKR)</label><input name="amount" type="number" min="1" max="500000" step="1" required></div><div class="field"><label>Note (optional)</label><input name="note" maxlength="200"></div></div>' +
      '<button class="btn btn--red" type="submit">Create link</button><p class="hint">The student pays exactly this amount. The link works for 14 days and once.</p><div id="lk-out"></div></form>' +
      (S.links.length ? '<div class="hist"><h4>Recent links</h4><ul>' + S.links.slice(0, 8).map(function (l) { return "<li><span>" + esc(l.students ? l.students.full_name : "") + " · " + esc(KIND[l.kind]) + " · " + pkr(l.amount) + '</span><span class="badge b-' + (l.status === "used" ? "successful" : l.status === "open" ? "pending" : "failed") + '">' + l.status + "</span></li>"; }).join("") + "</ul></div>" : "") + "</div></div>" +

      '<div class="card"><h3>Bank details and prices</h3><div class="pad"><form id="st-form">' +
      '<div class="field"><label>Bank name</label><input name="bank_name" maxlength="120" value="' + esc(cfg.bank_name) + '"></div>' +
      '<div class="field"><label>Account title</label><input name="account_title" maxlength="120" value="' + esc(cfg.account_title) + '"></div>' +
      '<div class="row"><div class="field"><label>IBAN</label><input name="iban" maxlength="40" value="' + esc(cfg.iban) + '"></div><div class="field"><label>Account number</label><input name="account_number" maxlength="40" value="' + esc(cfg.account_number) + '"></div></div>' +
      '<div class="field"><label>Branch (optional)</label><input name="branch" maxlength="120" value="' + esc(cfg.branch) + '"></div>' +
      '<div class="field"><label>Instructions shown to payers (optional)</label><textarea name="instructions" rows="2" maxlength="600">' + esc(cfg.instructions) + "</textarea></div>" +
      '<div class="row">' + ["monthly", "family", "admission", "gi", "personal"].map(function (k) { return '<div class="field"><label>' + KIND[k] + ' (PKR)</label><input name="p_' + k + '" type="number" min="1" max="500000" step="1" value="' + esc((cfg.prices || {})[k]) + '"></div>'; }).join("") + "</div>" +
      '<button class="btn btn--red" type="submit">Save</button><p class="hint">These are what customers see and pay. Customers cannot change an amount.</p></form></div></div></div>';

    var lk = $("#lk-form"); if (lk) { setAmount(lk); lk.student_id.addEventListener("change", function () { setAmount(lk); }); lk.kind.addEventListener("change", function () { setAmount(lk); }); }
  }
  function setAmount(f) {
    var k = f.kind.value, s = S.students.filter(function (x) { return x.id === f.student_id.value; })[0];
    f.amount.value = k === "monthly" && s ? s.monthly_fee : ((S.settings && S.settings.prices) || {})[k] || "";
    f.month.parentElement.style.opacity = (k === "monthly" || k === "family") ? 1 : .4;
  }

  /* ---------- dialogs ---------- */
  function dlg(id, title, body, foot) {
    var d = document.getElementById(id); if (d) d.remove();
    d = document.createElement("dialog"); d.id = id;
    d.innerHTML = '<div class="dlg__h"><b>' + esc(title) + '</b><button class="x" type="button" data-x aria-label="Close">×</button></div><div class="dlg__b">' + body + '</div><div class="dlg__f">' + foot + "</div>";
    document.body.appendChild(d);
    $$("[data-x]", d).forEach(function (b) { b.addEventListener("click", function () { d.close(); }); });
    d.showModal(); return d;
  }
  function byId(id) { return S.payments.filter(function (p) { return p.id === id; })[0]; }

  function openReceipt(p) {
    var w = window.open("", "_blank");
    sb.storage.from("receipts").createSignedUrl(p.receipt_path, 300).then(function (r) {
      if (r.error || !r.data) { if (w) w.close(); return fail(r.error || new Error("Could not open the receipt")); }
      if (w) w.location = r.data.signedUrl; else window.open(r.data.signedUrl, "_blank");
    });
  }
  function openApprove(p) {
    var d = dlg("dlg-approve", "Approve bank transfer",
      '<p><b>' + pkr(p.amount) + "</b> — " + esc(KIND[p.kind]) + (p.period ? " " + esc(monthName(p.period)) : "") + " — " + esc(p.payer_name || "") + '</p><p class="hint">Only approve after you have seen this credit in the bank account statement. A receipt screenshot alone is not proof.</p>' +
      '<form id="ap-form"><div class="field"><label>Bank reference of the credit (from your statement) *</label><input name="ref" minlength="4" maxlength="80" required></div>' +
      '<div class="field"><label>Note (optional)</label><input name="note" maxlength="300"></div><label class="chk"><input type="checkbox" name="ok" required> I checked this amount in our bank account</label></form>',
      '<button class="btn" type="button" data-x>Cancel</button><button class="btn btn--ok" type="button" id="ap-go">Approve payment</button>');
    $("#ap-go", d).addEventListener("click", function () {
      var f = $("#ap-form", d); if (!f.reportValidity()) return;
      this.disabled = true;
      review(p.id, "approve", f.ref.value, f.note.value).then(function () { d.close(); });
    });
  }
  function openReject(p) {
    var d = dlg("dlg-reject", "Reject payment",
      "<p>" + pkr(p.amount) + " — " + esc(p.payer_name || "") + '</p><form id="rj-form"><div class="field"><label>Reason (the payer will see it) *</label><input name="note" minlength="3" maxlength="300" required placeholder="e.g. No matching credit in our account"></div></form>',
      '<button class="btn" type="button" data-x>Cancel</button><button class="btn btn--red" type="button" id="rj-go">Reject payment</button>');
    $("#rj-go", d).addEventListener("click", function () {
      var f = $("#rj-form", d); if (!f.reportValidity()) return;
      this.disabled = true;
      review(p.id, "reject", "", f.note.value).then(function () { d.close(); });
    });
  }
  function review(id, decision, ref, note) {
    return sb.rpc("bank_review", { p_payment_id: id, p_decision: decision, p_credit_ref: ref, p_note: note })
      .then(function (r) { if (r.error) throw r.error; toast(decision === "approve" ? "Payment approved and added to fee records" : "Payment rejected"); return load(); })
      .catch(function (e) { fail(e); });
  }
  function openEvents(p) {
    q(sb.from("payment_events").select("*").eq("payment_id", p.id).order("at")).then(function (ev) {
      dlg("dlg-events", "History — " + p.reference,
        '<div class="hist" style="border:0;margin:0;padding:0"><ul>' + (ev.length ? ev.map(function (e) { return "<li><span><b>" + esc(e.event.replace(/_/g, " ")) + "</b> · " + esc(e.actor) + '</span><span class="sub">' + esc(when(e.at)) + "</span></li>"; }).join("") : "<li>No events</li>") + "</ul></div>",
        '<button class="btn" type="button" data-x>Close</button>');
    }).catch(fail);
  }

  /* ---------- actions ---------- */
  root.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"); if (!b) return;
    var p = byId(b.dataset.id), act = b.dataset.act;
    if (act === "reload") return load();
    if (act === "receipt" && p) return openReceipt(p);
    if (act === "approve" && p) return openApprove(p);
    if (act === "reject" && p) return openReject(p);
    if (act === "events" && p) return openEvents(p);
    if (act === "attach" && p) {
      var sel = $('[data-att="' + p.id + '"]', root); if (!sel || !sel.value) return toast("Choose a student first", true);
      b.disabled = true;
      sb.rpc("payment_attach_student", { p_payment_id: p.id, p_student_id: sel.value }).then(function (r) { if (r.error) throw r.error; toast("Attached" + (p.status === "successful" ? " and recorded in fees" : "")); return load(); }).catch(fail).then(function () { b.disabled = false; });
    }
    if (act === "recheck") {
      b.disabled = true; var old = b.textContent; b.textContent = "Checking…";
      sb.auth.getSession().then(function (r) {
        var t = r.data && r.data.session && r.data.session.access_token;
        return fetch(API, { method: "POST", headers: { "Content-Type": "application/json", apikey: C.supabaseKey || "", Authorization: "Bearer " + t }, body: JSON.stringify({ action: "recheck" }) });
      }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || "Failed"); return j; }); })
        .then(function (j) { toast(j.checked ? "Checked " + j.checked + " payment(s) with the gateway" : "Nothing to check"); return load(); }).catch(fail)
        .then(function () { b.disabled = false; b.textContent = old; });
    }
  });
  root.addEventListener("input", function (e) { if (e.target.id === "pf-q") { S.search = e.target.value; clearTimeout(load._t); load._t = setTimeout(function () { var pos = e.target.selectionStart; render(); var i = $("#pf-q", root); i.focus(); i.setSelectionRange(pos, pos); }, 250); } });
  root.addEventListener("change", function (e) { if (e.target.id === "pf-s") { S.status = e.target.value; render(); } if (e.target.id === "pf-m") { S.method = e.target.value; render(); } });

  root.addEventListener("submit", function (e) {
    if (e.target.id === "lk-form") {
      e.preventDefault(); var f = e.target, k = f.kind.value;
      if ((k === "monthly" || k === "family") && !f.month.value) return toast("Choose the month", true);
      var row = { student_id: f.student_id.value, kind: k, period: (k === "monthly" || k === "family") ? f.month.value + "-01" : null, amount: +f.amount.value, note: f.note.value.trim() || null };
      sb.auth.getSession().then(function (r) {
        row.created_by = r.data && r.data.session ? r.data.session.user.email : null;
        return q(sb.from("payment_links").insert(row).select("*").single());
      }).then(function (l) {
        var url = new URL("pay.html?link=" + l.token, location.href).href, stu = S.students.filter(function (s) { return s.id === l.student_id; })[0];
        var msg = "Assalam o Alaikum! Please pay " + pkr(l.amount) + " (" + KIND[l.kind] + (l.period ? " " + monthName(l.period) : "") + ") here: " + url;
        var phone = stu && stu.phone ? String(stu.phone).replace(/\D/g, "").replace(/^0/, "92") : "";
        $("#lk-out").innerHTML = '<div class="linkbox">' + esc(url) + '</div><div class="acts" style="justify-content:flex-start"><button class="btn btn--sm" type="button" id="lk-copy">Copy link</button>' +
          (phone ? '<a class="btn btn--sm" target="_blank" rel="noopener" href="https://wa.me/' + phone + "?text=" + encodeURIComponent(msg) + '">Send on WhatsApp</a>' : "") + "</div>";
        $("#lk-copy").addEventListener("click", function () { if (navigator.clipboard) navigator.clipboard.writeText(url); toast("Link copied"); });
        S.links.unshift(l);
      }).catch(fail);
    }
    if (e.target.id === "st-form") {
      e.preventDefault(); var g = e.target, prices = {}, ok = true;
      ["monthly", "family", "admission", "gi", "personal"].forEach(function (k) { var v = parseInt(g["p_" + k].value, 10); if (!(v > 0 && v <= 500000)) ok = false; prices[k] = v; });
      if (!ok) return toast("Enter a price for every item", true);
      var upd = { bank_name: g.bank_name.value.trim() || null, account_title: g.account_title.value.trim() || null, iban: g.iban.value.trim() || null, account_number: g.account_number.value.trim() || null,
        branch: g.branch.value.trim() || null, instructions: g.instructions.value.trim() || null, prices: prices, updated_at: new Date().toISOString() };
      q(sb.from("payment_settings").update(upd).eq("id", 1).select("*").single()).then(function (s) { S.settings = s; toast("Saved"); render(); }).catch(fail);
    }
  });

  /* ---------- wiring ---------- */
  var tab = $('[data-tab="payments"]');
  if (tab) tab.addEventListener("click", function () { if (!S.loaded) load(); else render(); });
  var rf = document.getElementById("b-refresh"); if (rf) rf.addEventListener("click", function () { if (!root.hidden) load(); });
  sb.auth.onAuthStateChange(function (ev, session) {
    if (session && (ev === "SIGNED_IN" || ev === "INITIAL_SESSION")) setTimeout(function () { load(true); }, 800);
    if (ev === "SIGNED_OUT") { S.loaded = false; S.payments = []; badge(); }
  });
})();
