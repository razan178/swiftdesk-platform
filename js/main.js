/* ==========================================================================
   MERIDIAN — main.js
   Vanilla JS. No dependencies. Reads all business data from window.SITE_CONFIG.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var WA_BASE = "https://wa.me/";

  /* ---------- Analytics (fires only if IDs configured) ------------------- */
  // Central event hook. Wire up GA4 / Meta Pixel here — one place to edit.
  function track(event, params) {
    params = params || {};
    try {
      if (window.gtag) window.gtag("event", event, params);
      if (window.fbq)  window.fbq("trackCustom", event, params);
      // Always log in dev so you can verify events without analytics installed.
      if (window.console) console.debug("[track]", event, params);
    } catch (e) {}
  }

  // Optional: auto-load GA4 if a measurement ID is present in config.
  (function loadGA() {
    var id = (CFG.ANALYTICS || {}).GA4_MEASUREMENT_ID;
    if (!id) return;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", id);
  })();

  // Optional: auto-load Meta Pixel if an ID is present in config.
  (function loadPixel() {
    var id = (CFG.ANALYTICS || {}).META_PIXEL_ID;
    if (!id) return;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", id); window.fbq("track", "PageView");
  })();

  /* ---------- WhatsApp / phone helpers ----------------------------------- */
  function digitsOnly(v) { return String(v || "").replace(/[^0-9]/g, ""); }

  function waURL(message) {
    var num = digitsOnly(CFG.WHATSAPP_NUMBER);
    var url = WA_BASE + num;
    if (message) url += "?text=" + encodeURIComponent(message);
    return url;
  }

  function fillTemplate(tpl, data) {
    return String(tpl).replace(/\{(\w+)\}/g, function (_, k) {
      return (data[k] != null && data[k] !== "") ? data[k] : "—";
    });
  }

  /* ---------- Wire up static WhatsApp / phone / email / social links ------ */
  function initLinks() {
    var genericMsg = CFG.WHATSAPP_GENERIC_MESSAGE || "";
    var waHref = waURL(genericMsg);

    document.querySelectorAll(".js-wa").forEach(function (a) {
      a.setAttribute("href", waHref);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
      a.addEventListener("click", function () {
        track("whatsapp_click", { location: a.getAttribute("data-cta") || "unknown" });
      });
    });

    document.querySelectorAll(".js-phone").forEach(function (a) {
      a.setAttribute("href", "tel:" + (CFG.PHONE_DIAL || ""));
      a.addEventListener("click", function () {
        track("phone_click", { location: a.getAttribute("data-cta") || "unknown" });
      });
    });

    document.querySelectorAll(".js-email").forEach(function (a) {
      var email = (CFG.SOCIAL || {}).email;
      if (email) a.setAttribute("href", "mailto:" + email);
    });

    document.querySelectorAll(".js-social").forEach(function (a) {
      var net = a.getAttribute("data-net");
      var url = (CFG.SOCIAL || {})[net];
      if (url && url !== "#") { a.setAttribute("href", url); a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener"); }
      else { a.style.display = "none"; } // hide un-configured socials gracefully
    });

    // Generic CTA (anchor to lead form) tracking
    document.querySelectorAll(".js-cta").forEach(function (a) {
      a.addEventListener("click", function () {
        track("cta_click", { location: a.getAttribute("data-cta") || "unknown" });
      });
    });
  }

  /* ---------- Nav: scroll state + mobile menu ---------------------------- */
  function initNav() {
    var nav = document.getElementById("nav");
    var burger = document.getElementById("burger");
    var menu = document.getElementById("mobileMenu");

    var onScroll = function () {
      if (window.scrollY > 12) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    function closeMenu() {
      menu.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
    function openMenu() {
      menu.classList.add("open");
      burger.setAttribute("aria-expanded", "true");
      menu.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    burger.addEventListener("click", function () {
      menu.classList.contains("open") ? closeMenu() : openMenu();
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) closeMenu();
    });
  }

  /* ---------- FAQ accordion ---------------------------------------------- */
  function initFAQ() {
    document.querySelectorAll(".faq__item").forEach(function (item) {
      var btn = item.querySelector(".faq__q");
      var panel = item.querySelector(".faq__a");
      btn.addEventListener("click", function () {
        var isOpen = item.classList.contains("open");
        // close others (single-open accordion)
        document.querySelectorAll(".faq__item.open").forEach(function (o) {
          if (o !== item) { o.classList.remove("open"); o.querySelector(".faq__a").style.maxHeight = null; o.querySelector(".faq__q").setAttribute("aria-expanded", "false"); }
        });
        if (isOpen) {
          item.classList.remove("open"); panel.style.maxHeight = null; btn.setAttribute("aria-expanded", "false");
        } else {
          item.classList.add("open"); panel.style.maxHeight = panel.scrollHeight + "px"; btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  /* ---------- Reveal on scroll ------------------------------------------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Lead form: validation + WhatsApp redirect ------------------ */
  function initForm() {
    var form = document.getElementById("leadForm");
    if (!form) return;
    var success = document.getElementById("formSuccess");
    var successBtn = document.getElementById("successWaBtn");
    var startedTracked = false;

    // Track "form_started" on first interaction
    form.addEventListener("input", function () {
      if (!startedTracked) { startedTracked = true; track("form_started", {}); }
    }, { once: false });

    function fieldWrap(el) { return el.closest(".field"); }
    function setError(el, on) {
      var wrap = fieldWrap(el);
      if (!wrap) return;
      wrap.classList.toggle("show-err", on);
      if (el.classList) el.classList.toggle("invalid", on);
    }

    function validate() {
      var ok = true;
      var name = form.name;
      var phone = form.phone;
      var country = form.country;
      var timing = form.timing;
      var exam = form.querySelector('input[name="exam"]:checked');

      if (!name.value.trim()) { setError(name, true); ok = false; } else setError(name, false);

      if (digitsOnly(phone.value).length < 10) { setError(phone, true); ok = false; } else setError(phone, false);

      if (!country.value) { setError(country, true); ok = false; } else setError(country, false);
      if (!timing.value) { setError(timing, true); ok = false; } else setError(timing, false);

      var examWrap = form.querySelector(".seg").closest(".field");
      if (!exam) { examWrap.classList.add("show-err"); ok = false; } else examWrap.classList.remove("show-err");

      return ok;
    }

    // Clear error as user fixes a field
    form.querySelectorAll("input, select").forEach(function (el) {
      var evt = (el.tagName === "SELECT" || el.type === "radio") ? "change" : "input";
      el.addEventListener(evt, function () {
        if (el.type === "radio") { form.querySelector(".seg").closest(".field").classList.remove("show-err"); }
        else setError(el, false);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) {
        // focus first invalid field
        var firstErr = form.querySelector(".field.show-err input, .field.show-err select");
        if (firstErr) firstErr.focus();
        return;
      }

      var data = {
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        country: form.country.value,
        timing: form.timing.value,
        exam: (form.querySelector('input[name="exam"]:checked') || {}).value || "Not sure yet",
        goal: form.goal.value || "Not specified"
      };

      var msg = fillTemplate(CFG.WHATSAPP_MESSAGE_TEMPLATE || "", data);
      var url = waURL(msg);

      track("form_submitted", { exam: data.exam, country: data.country, goal: data.goal });
      track("generate_lead", { exam: data.exam }); // GA4 recommended conversion event

      /* --- OPTIONAL: also send the lead to a CRM / Google Sheet / webhook ----
         Uncomment and point at your endpoint. The WhatsApp redirect below still
         runs regardless, so a failed/slow request never blocks the visitor.
         fetch("https://YOUR_ENDPOINT_HERE", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(data),
           keepalive: true
         }).catch(function () {});
      ----------------------------------------------------------------------- */

      // Prepare success state + fallback button (in case popup blocked)
      successBtn.setAttribute("href", url);
      successBtn.setAttribute("target", "_blank");
      successBtn.setAttribute("rel", "noopener");
      form.style.display = "none";
      success.classList.add("show");

      // Redirect to WhatsApp
      var win = window.open(url, "_blank");
      // If blocked, navigate current tab as a fallback shortly after.
      if (!win) { window.location.href = url; }

      success.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* ---------- Footer year ------------------------------------------------ */
  function initMisc() {
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- FAQ schema (injected so it always matches visible content) -- */
  function injectFAQSchema() {
    var items = [];
    document.querySelectorAll(".faq__item").forEach(function (item) {
      var q = item.querySelector(".faq__q span");
      var a = item.querySelector(".faq__a p");
      if (q && a) {
        items.push({
          "@type": "Question",
          "name": q.textContent.trim(),
          "acceptedAnswer": { "@type": "Answer", "text": a.textContent.trim() }
        });
      }
    });
    if (!items.length) return;
    var schema = { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": items };
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);
  }

  /* ---------- Boot ------------------------------------------------------- */
  function boot() {
    initLinks();
    initNav();
    initFAQ();
    initReveal();
    initForm();
    initMisc();
    injectFAQSchema();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
