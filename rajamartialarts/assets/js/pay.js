/* Raja's Martial Arts — customer payment pages (pay.html and pay-result.html).
   This file never decides whether a payment succeeded. It only asks the server (the "pay" function) and shows what the server says. */
(function () {
  "use strict";
  var C = window.RAJA || {};
  var API = String(C.supabaseUrl || "").replace(/\/$/, "") + "/functions/v1/pay/api";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var qs = new URLSearchParams(location.search);

  var KIND = { monthly: "Monthly fee", admission: "Admission fee (one-time)", gi: "Gi (dojo uniform)", personal: "Personal training (1-on-1)" };
  var METHOD = {
    easypaisa: { name: "Easypaisa", note: "Pay with your Easypaisa account or card" },
    jazzcash: { name: "JazzCash", note: "Pay with your JazzCash account or card" },
    bank_transfer: { name: "Bank transfer", note: "Send from any bank app, then upload your receipt" }
  };
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pkr(n) { return "PKR " + Number(n || 0).toLocaleString("en-PK"); }
  function monthLabel(p) { if (!p) return ""; var d = new Date(p + "T00:00:00"); return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" }); }
  function waLink(text) { return "https://wa.me/" + String(C.whatsapp || "").replace(/\D/g, "") + "?text=" + encodeURIComponent(text); }

  function api(action, body) {
    if (!C.supabaseUrl) return Promise.reject(new Error("Online payments are not set up yet."));
    return fetch(API, {
      method: "POST", headers: { "Content-Type": "application/json", apikey: C.supabaseKey || "" },
      body: JSON.stringify(Object.assign({ action: action }, body || {}))
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || "Something went wrong. Please try again."); return j; });
    });
  }

  /* ---------------------------------------------------------------- pay.html */
  var app = $("#pay-app");
  if (app) {
    var cfg = null, link = null;

    var busy = function (btn, on, label) { if (!btn) return; btn.disabled = on; if (label) btn.textContent = on ? "Please wait…" : label; };
    var showErr = function (msg) { var e = $("#pay-err"); if (e) { e.textContent = msg || ""; e.hidden = !msg; if (msg) e.scrollIntoView({ block: "center", behavior: "smooth" }); } };

    var start = function () {
      app.innerHTML = '<p class="pay-load">Loading…</p>';
      var tasks = [api("config")];
      var token = qs.get("link");
      if (token) tasks.push(api("link", { token: token }));
      Promise.all(tasks).then(function (res) {
        cfg = res[0]; link = res[1] && res[1].valid ? res[1] : null;
        if (token && !link) { renderNotice("This payment link is not valid any more", "It may have expired or already been used. Please ask the dojo for a new link."); return; }
        var any = cfg.methods.bank_transfer || cfg.methods.jazzcash || cfg.methods.easypaisa;
        if (!any) { renderNotice("Online payments are being set up", "You can pay at the dojo or message us on WhatsApp and we will help you right away."); return; }
        var ref = qs.get("ref");
        if (ref) { resume(ref); return; }
        renderForm();
      }).catch(function (e) { renderNotice("We couldn't load the payment page", e.message); });
    };

    var renderNotice = function (title, text) {
      app.innerHTML = '<div class="pay-notice"><h2>' + esc(title) + "</h2><p>" + esc(text) + '</p><a class="btn btn--red" data-wa="Assalam o Alaikum! I need help with paying fees." href="#" target="_blank" rel="noopener">Message us on WhatsApp</a></div>';
      var a = $("[data-wa]", app); if (a) a.href = waLink(a.getAttribute("data-wa"));
    };

    var monthOptions = function () {
      var d = new Date(), out = [];
      for (var i = -1; i <= 3; i++) {
        var m = new Date(d.getFullYear(), d.getMonth() + i, 1);
        var v = m.getFullYear() + "-" + String(m.getMonth() + 1).padStart(2, "0");
        out.push('<option value="' + v + '"' + (i === 0 ? " selected" : "") + ">" + m.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) + "</option>");
      }
      return out.join("");
    };

    var renderForm = function () {
      var firstOk = ["easypaisa", "jazzcash", "bank_transfer"].filter(function (m) { return cfg.methods[m]; })[0];
      var kinds = "";
      if (link) {
        kinds = '<div class="pay-summary"><span>Paying for</span><b>' + esc(KIND[link.kind]) + (link.period ? " — " + esc(monthLabel(link.period)) : "") + "</b>" +
          "<strong>" + pkr(link.amount) + "</strong>" + (link.first_name ? "<small>For " + esc(link.first_name) + "</small>" : "") + (link.note ? "<small>" + esc(link.note) + "</small>" : "") + "</div>";
      } else {
        kinds = '<fieldset class="pay-kinds"><legend>What are you paying for?</legend>' + ["monthly", "admission", "gi", "personal"].map(function (k, i) {
          var price = cfg.prices && cfg.prices[k];
          if (!price) return "";
          return '<label class="pay-opt"><input type="radio" name="kind" value="' + k + '"' + (i === 0 ? " checked" : "") + '><span><b>' + esc(KIND[k]) + "</b><em>" + pkr(price) + "</em></span></label>";
        }).join("") + '</fieldset><div class="field" id="month-field"><label for="pay-month">For which month?</label><select id="pay-month">' + monthOptions() + "</select></div>";
      }
      var methods = ["easypaisa", "jazzcash", "bank_transfer"].map(function (m) {
        var ok = !!cfg.methods[m];
        return '<label class="pay-method' + (ok ? "" : " is-off") + '"><input type="radio" name="method" value="' + m + '"' + (m === firstOk ? " checked" : "") + (ok ? "" : " disabled") + ">" +
          '<span class="pay-method__logo pay-method__logo--' + m + '" aria-hidden="true">' + (m === "bank_transfer" ? "🏦" : esc(METHOD[m].name.charAt(0))) + '</span><span class="pay-method__t"><b>' + esc(METHOD[m].name) + "</b><em>" +
          (ok ? esc(METHOD[m].note) : "Not available yet") + "</em></span></label>";
      }).join("");
      app.innerHTML =
        '<form id="pay-form" novalidate>' +
        '<h2>1. Your payment</h2>' + kinds +
        '<div class="pay-row"><div class="field"><label for="pay-name">Student\'s full name</label><input id="pay-name" autocomplete="name" required></div>' +
        '<div class="field"><label for="pay-phone">Phone / WhatsApp</label><input id="pay-phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="0300 1234567" required></div></div>' +
        '<h2>2. How would you like to pay?</h2><div class="pay-methods">' + methods + "</div>" +
        (cfg.mode === "sandbox" ? '<p class="pay-test">Test mode: payments here are for testing only.</p>' : "") +
        '<p class="pay-err" id="pay-err" role="alert" hidden></p>' +
        '<button class="btn btn--red btn--full" type="submit" id="pay-go">Continue</button>' +
        '<p class="pay-fine">Payments are confirmed by our server with the payment provider or our bank. A screenshot alone never confirms a payment.</p></form>';
      var mf = $("#month-field");
      var sync = function () { if (mf) { var k = ($('input[name="kind"]:checked') || {}).value; mf.hidden = k !== "monthly"; } };
      $$('input[name="kind"]').forEach(function (r) { r.addEventListener("change", sync); }); sync();
      $("#pay-form").addEventListener("submit", submitForm);
    };

    var submitForm = function (e) {
      e.preventDefault(); showErr("");
      var btn = $("#pay-go"), kind = link ? null : ($('input[name="kind"]:checked') || {}).value;
      var method = ($('input[name="method"]:checked') || {}).value;
      var name = $("#pay-name").value.trim(), phone = $("#pay-phone").value.trim();
      if (!method) return showErr("Choose a payment method.");
      if (name.length < 2) return showErr("Enter the student's full name.");
      if (!/^[0-9+()\-\s]{7,30}$/.test(phone)) return showErr("Enter a valid phone number, for example 0300 1234567.");
      busy(btn, true, "Continue");
      var body = { method: method, name: name, phone: phone };
      if (link) body.link = qs.get("link"); else { body.kind = kind; if (kind === "monthly") body.month = $("#pay-month").value; }
      api("start", body).then(function (r) {
        if (r.checkout) goGateway(r.checkout); else renderBank(r);
      }).catch(function (err) { showErr(err.message); busy(btn, false, "Continue"); });
    };

    var goGateway = function (co) {
      app.innerHTML = '<p class="pay-load">Taking you to the payment page…</p>';
      var f = document.createElement("form"); f.method = co.method; f.action = co.url; f.style.display = "none";
      Object.keys(co.fields).forEach(function (k) { var i = document.createElement("input"); i.type = "hidden"; i.name = k; i.value = co.fields[k]; f.appendChild(i); });
      document.body.appendChild(f); f.submit();
    };

    var copyBtn = function (val) { return '<button type="button" class="pay-copy" data-copy="' + esc(val) + '">Copy</button>'; };
    var renderBank = function (r) {
      var b = r.bank || {};
      var rows = [["Bank", b.bank_name], ["Account title", b.account_title], ["IBAN", b.iban], ["Account number", b.account_number], ["Branch", b.branch]]
        .filter(function (x) { return x[1]; }).map(function (x) { return "<dt>" + x[0] + "</dt><dd><span>" + esc(x[1]) + "</span>" + (x[0] === "IBAN" || x[0] === "Account number" ? copyBtn(x[1]) : "") + "</dd>"; }).join("");
      app.innerHTML =
        '<div class="pay-ok"><h2>Bank transfer</h2>' +
        '<div class="pay-ref"><span>Your payment reference</span><b>' + esc(r.reference) + "</b>" + copyBtn(r.reference) + "<small>Write this reference in the transfer notes if your bank allows it.</small></div>" +
        '<div class="pay-summary"><span>Amount to send</span><strong>' + pkr(r.amount) + "</strong><b>" + esc(KIND[r.kind] || r.kind) + (r.period ? " — " + esc(monthLabel(r.period)) : "") + "</b></div>" +
        '<dl class="pay-bank">' + rows + "</dl>" +
        (r.instructions ? '<p class="pay-ins">' + esc(r.instructions) + "</p>" : "") +
        '<form id="rc-form" novalidate><h3>After you have sent the money</h3>' +
        '<div class="field"><label for="rc-file">Upload the receipt (photo, screenshot or PDF, up to 5 MB)</label><input id="rc-file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required></div>' +
        '<div class="pay-row"><div class="field"><label for="rc-sender">Name on the sending account (optional)</label><input id="rc-sender" maxlength="120"></div>' +
        '<div class="field"><label for="rc-ref">Your bank\'s transaction ID (optional)</label><input id="rc-ref" maxlength="80"></div></div>' +
        '<p class="pay-err" id="pay-err" role="alert" hidden></p><button class="btn btn--red btn--full" type="submit" id="rc-go">Send receipt</button>' +
        '<p class="pay-fine">Your payment stays <b>pending</b> until our team checks the money in our bank account. This usually takes one working day. Keep this reference: <b>' + esc(r.reference) + "</b></p></form></div>";
      $$(".pay-copy", app).forEach(function (b) { b.addEventListener("click", function () {
        var v = b.getAttribute("data-copy"); var done = function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy"; }, 1500); };
        if (navigator.clipboard) navigator.clipboard.writeText(v).then(done, done); else done();
      }); });
      $("#rc-form").addEventListener("submit", function (e) { e.preventDefault(); sendReceipt(r.reference); });
      history.replaceState(null, "", "pay.html?ref=" + encodeURIComponent(r.reference));
    };

    var sendReceipt = function (reference) {
      showErr("");
      var f = $("#rc-file").files[0], btn = $("#rc-go");
      if (!f) return showErr("Choose your receipt file first.");
      var ext = (f.name.split(".").pop() || "").toLowerCase();
      var mime = f.type || ({ jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", pdf: "application/pdf" })[ext] || "";
      if (["image/jpeg", "image/png", "image/webp", "application/pdf"].indexOf(mime) < 0) return showErr("Please upload a JPG, PNG or WebP image, or a PDF.");
      if (f.size > 5 * 1024 * 1024) return showErr("That file is larger than 5 MB.");
      if (!window.supabase) return showErr("Upload is not available right now. Please message us on WhatsApp.");
      busy(btn, true, "Send receipt");
      api("receipt-url", { reference: reference, mime: mime, size: f.size }).then(function (u) {
        var sbc = window.supabase.createClient(C.supabaseUrl, C.supabaseKey, { auth: { persistSession: false } });
        return sbc.storage.from("receipts").uploadToSignedUrl(u.path, u.token, f, { contentType: mime }).then(function (res) {
          if (res.error) throw new Error("The upload did not go through. Please try again.");
          return api("receipt-confirm", { reference: reference, path: u.path, sender: $("#rc-sender").value, payer_ref: $("#rc-ref").value });
        });
      }).then(function () { location.href = "pay-result.html?ref=" + encodeURIComponent(reference); })
        .catch(function (err) { showErr(err.message); busy(btn, false, "Send receipt"); });
    };

    var resume = function (ref) {
      api("status", { reference: ref }).then(function (s) {
        if (s.method === "bank_transfer" && s.status === "pending" && s.bank) { renderBank(Object.assign({ reference: s.reference }, s)); return; }
        location.replace("pay-result.html?ref=" + encodeURIComponent(ref));
      }).catch(function () { renderForm(); });
    };

    start();
  }

  /* ---------------------------------------------------------------- pay-result.html */
  var box = $("#pay-result");
  if (box) {
    var ref = qs.get("ref") || "", tries = 0;
    var view = function (s) {
      var what = (KIND[s.kind] || s.kind) + (s.period ? " — " + monthLabel(s.period) : "");
      var meta = '<dl class="pay-bank"><dt>Reference</dt><dd><span>' + esc(s.reference) + "</span></dd><dt>For</dt><dd><span>" + esc(what) + "</span></dd><dt>Amount</dt><dd><span>" + pkr(s.amount) + "</span></dd></dl>";
      var wa = '<a class="btn btn--line" target="_blank" rel="noopener" href="' + esc(waLink("Assalam o Alaikum! About my payment, reference " + s.reference)) + '">Message us on WhatsApp</a>';
      if (s.status === "successful") return '<div class="pay-state is-ok"><div class="pay-state__i">✓</div><h2>Payment confirmed</h2><p>Thank you! Your payment has been verified.</p>' + meta + '<a class="btn btn--red" href="index.html">Back to the website</a></div>';
      if (s.status === "failed") return '<div class="pay-state is-bad"><div class="pay-state__i">!</div><h2>Payment not completed</h2><p>' + esc(s.failure_reason || "The payment did not go through.") + "</p>" + meta +
        '<div class="pay-actions"><a class="btn btn--red" href="pay.html">Try again</a>' + wa + "</div></div>";
      if (s.method === "bank_transfer" && !s.receipt_submitted) return '<div class="pay-state is-wait"><div class="pay-state__i">⏳</div><h2>Waiting for your receipt</h2><p>Send the money, then upload the receipt so we can check it.</p>' + meta +
        '<div class="pay-actions"><a class="btn btn--red" href="pay.html?ref=' + encodeURIComponent(s.reference) + '">Upload receipt</a>' + wa + "</div></div>";
      if (s.method === "bank_transfer") return '<div class="pay-state is-wait"><div class="pay-state__i">⏳</div><h2>Receipt received — pending</h2><p>We will check the money in our bank account and confirm your payment, usually within one working day. You don\'t need to do anything else.</p>' + meta + '<div class="pay-actions">' + wa + "</div></div>";
      return '<div class="pay-state is-wait"><div class="pay-state__i pay-spin" aria-hidden="true"></div><h2>Confirming your payment…</h2><p>This page updates by itself. Please don\'t close it.</p>' + meta + "</div>";
    };
    var poll = function () {
      api("status", { reference: ref }).then(function (s) {
        box.innerHTML = view(s);
        if (s.status === "pending" && s.method !== "bank_transfer" && tries++ < 36) setTimeout(poll, 5000);
      }).catch(function (e) { box.innerHTML = '<div class="pay-notice"><h2>We couldn\'t find this payment</h2><p>' + esc(e.message) + '</p><a class="btn btn--red" href="pay.html">Start a payment</a></div>'; });
    };
    if (!ref) box.innerHTML = '<div class="pay-notice"><h2>No payment selected</h2><a class="btn btn--red" href="pay.html">Start a payment</a></div>'; else poll();
  }
})();
