/* Raja's Martial Arts — shared behaviour for every page. All lookups are null-guarded. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* Always open a page at the top. The browser would otherwise restore an old
     scroll position (on reload, back/forward, or inside a preview frame).
     Only a link that names a section (e.g. index.html#trial) lands on that section. */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  function startPosition() {
    var id = location.hash ? decodeURIComponent(location.hash.slice(1)) : "";
    var target = id && document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "instant", block: "start" });
    else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }
  window.RMA_startPosition = startPosition;
  startPosition();
  window.addEventListener("load", startPosition);
  window.addEventListener("pageshow", function (e) { if (e.persisted) startPosition(); });

  var C = window.RAJA || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function wa(text) {
    return "https://wa.me/" + String(C.whatsapp || "").replace(/\D/g, "") + (text ? "?text=" + encodeURIComponent(text) : "");
  }

  /* year */
  $$(".js-year").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* WhatsApp links */
  $$("[data-wa]").forEach(function (a) {
    a.href = wa(a.getAttribute("data-wa") || "Assalam o Alaikum! I'd like to know more about classes.");
    a.target = "_blank"; a.rel = "noopener";
  });

  /* contact details from config.js */
  var ad = C.address || {};
  var addr = [ad.line1, ad.city, ad.country].filter(Boolean).join(", ");
  $$("[data-bind]").forEach(function (el) {
    var k = el.getAttribute("data-bind");
    if (k === "phone" && C.phoneDisplay) el.textContent = C.phoneDisplay;
    if (k === "address" && addr) el.textContent = addr;
    if (k === "email") {
      if (C.email) { el.textContent = C.email; if (el.tagName === "A") el.href = "mailto:" + C.email; }
      else { var li = el.closest("li"); if (li) li.hidden = true; }
    }
  });
  $$("[data-social]").forEach(function (a) {
    var url = C[a.getAttribute("data-social")];
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; } else { a.hidden = true; }
  });

  /* photo placeholders: if the named file is missing, the labelled placeholder stays */
  $$(".ph > img, .logo__img > img").forEach(function (img) {
    function drop() { img.remove(); }
    if (img.complete && !img.naturalWidth) drop(); else img.addEventListener("error", drop);
  });

  /* header shadow + mobile drawer */
  var hdr = $(".hdr");
  function onScroll() { if (hdr) hdr.classList.toggle("is-scrolled", window.scrollY > 6); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var burger = $(".burger"), drawer = $(".drawer");
  if (burger && drawer) {
    var setOpen = function (open) {
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      drawer.hidden = !open;
    };
    burger.addEventListener("click", function () { setOpen(burger.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 1100) setOpen(false); });
    $$("a", drawer).forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
  }

  /* reveal on scroll */
  var rv = $$(".rv");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add("is-in"); });

  /* video: the play button loads assets/video/<file> if present */
  $$("[data-video]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var box = btn.closest("[data-video-box]") || btn.parentNode;
      var v = document.createElement("video");
      v.src = btn.getAttribute("data-video"); v.controls = true; v.autoplay = true; v.playsInline = true;
      v.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:4;background:#000";
      v.addEventListener("error", function () {
        v.remove(); btn.hidden = false;
        btn.setAttribute("title", "Video not added yet: " + btn.getAttribute("data-video"));
      });
      box.appendChild(v); btn.hidden = true;
    });
  });

  /* coach carousel */
  $$(".carousel").forEach(function (c) {
    var track = $(".carousel__track", c);
    var step = function (dir) { if (track) track.scrollBy({ left: dir * track.clientWidth * 0.9, behavior: "smooth" }); };
    var p = $(".carousel__btn--prev", c), n = $(".carousel__btn--next", c);
    if (p) p.addEventListener("click", function () { step(-1); });
    if (n) n.addEventListener("click", function () { step(1); });
  });

  /* terminology sliders — built from the <li> list in each category */
  $$("[data-term]").forEach(function (cat) {
    var items = $$(".term-data > li", cat).map(function (li) {
      return { img: li.getAttribute("data-img"), kind: li.getAttribute("data-kind"),
        name: $("h3", li).textContent, jp: $(".jp", li).textContent, desc: $("p", li).textContent };
    });
    var view = $(".term-slider", cat);
    if (!items.length || !view) return;
    $(".term-data", cat).hidden = true; view.hidden = false;
    var i = 0;
    var main = $(".term-main", view), info = $(".term-info", view);
    var prev = $(".term-side--prev", view), next = $(".term-side--next", view);
    var dots = $(".term-dots", cat), count = $(".term-count", cat);
    function ph(el, file, art) {
      el.setAttribute("data-file", file);
      if (art) el.setAttribute("data-art", art); // Japanese name shown as artwork until a photo is added
      el.innerHTML = '<img src="assets/img/' + file + '" alt="" loading="lazy">';
      var img = el.firstChild;
      img.addEventListener("error", function () { img.remove(); });
    }
    if (dots) items.forEach(function (_, k) {
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("aria-label", "Show term " + (k + 1));
      b.addEventListener("click", function () { go(k); });
      dots.appendChild(b);
    });
    var first = true;
    function go(k) {
      var dir = k < i ? -1 : 1;
      i = (k + items.length) % items.length;
      var it = items[i], pv = items[(i - 1 + items.length) % items.length], nx = items[(i + 1) % items.length];
      ph(main, it.img, it.jp);
      var mi = main.querySelector("img"); if (mi) mi.alt = it.name + " — Kyokushin " + it.kind;
      info.innerHTML = "<small></small><h3></h3><div class='jp'></div><p></p>";
      info.children[0].textContent = it.kind; info.children[1].textContent = it.name;
      info.children[2].textContent = it.jp; info.children[3].textContent = it.desc;
      ph($(".ph", prev), pv.img, pv.jp); ph($(".ph", next), nx.img, nx.jp);
      prev.setAttribute("aria-label", "Previous: " + pv.name);
      next.setAttribute("aria-label", "Next: " + nx.name);
      if (dots) $$("button", dots).forEach(function (b, k) { b.setAttribute("aria-current", String(k === i)); });
      if (count) {
        $("span", count).textContent = String(i + 1).padStart(2, "0") + " / " + String(items.length).padStart(2, "0");
        $("i", count).style.setProperty("--p", ((i + 1) / items.length * 100) + "%");
      }
      if (!first) cat.dispatchEvent(new CustomEvent("term:change", { bubbles: true, detail: { dir: dir } }));
      first = false;
    }
    prev.addEventListener("click", function () { go(i - 1); });
    next.addEventListener("click", function () { go(i + 1); });
    view.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") go(i - 1); if (e.key === "ArrowRight") go(i + 1);
    });
    var sx = null;
    main.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    main.addEventListener("touchend", function (e) {
      if (sx === null) return; var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); sx = null;
    });
    go(0);
  });

  /* map + directions: exact pin if lat/lng are set, otherwise the Google Maps search in config.js */
  var hasPin = typeof C.lat === "number" && typeof C.lng === "number";
  var mapQ = hasPin ? (C.lat + "," + C.lng) : (C.mapQuery || addr);
  if (mapQ) {
    $$("[data-map]").forEach(function (box) {
      var f = document.createElement("iframe");
      f.title = "Map: Raja's Martial Arts, Bahria Town Civic Center, Islamabad";
      f.loading = "lazy"; f.referrerPolicy = "no-referrer-when-downgrade"; f.allowFullscreen = true;
      f.src = "https://maps.google.com/maps?q=" + encodeURIComponent(mapQ) + "&z=16&output=embed";
      box.innerHTML = ""; box.appendChild(f);
    });
    $$("[data-directions]").forEach(function (a) {
      a.href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(mapQ);
      a.target = "_blank"; a.rel = "noopener";
    });
  }

  /* save a trial booking to the backend (Supabase "leads" table).
     Visitors can only insert — never read — so this is safe from the browser. */
  function saveLead(form, d) {
    if (d.get("bot-field")) return; // honeypot filled → bot, don't store
    if (!C.supabaseUrl || !C.supabaseKey || !window.fetch) return;
    var age = parseInt(d.get("age"), 10);
    var body = {
      name: String(d.get("name") || "").trim().slice(0, 100),
      phone: String(d.get("phone") || "").trim().slice(0, 30),
      age: age >= 3 && age <= 99 ? age : null,
      course: d.get("course") || null,
      preferred_time: d.get("time") || null
    };
    fetch(C.supabaseUrl.replace(/\/$/, "") + "/rest/v1/leads", {
      method: "POST",
      keepalive: true,
      headers: { "apikey": C.supabaseKey, "Content-Type": "application/json", "Prefer": "return=minimal" },
      body: JSON.stringify(body)
    }).catch(function () {});
  }

  /* trial / enquiry forms → saved to the backend + WhatsApp message */
  $$("form[data-trial]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form), lines = ["Assalam o Alaikum! I'd like to book a free trial class.", ""];
      $$("[name]", form).forEach(function (f) {
        if (f.type === "hidden" || f.name === "bot-field" || !f.value) return;
        var lab = form.querySelector('label[for="' + f.id + '"]');
        lines.push((lab ? lab.textContent.replace(/\s*\(.*\)/, "") : f.name) + ": " + f.value);
      });
      var win = window.open(wa(lines.join("\n")), "_blank", "noopener");
      saveLead(form, d);
      var note = $(".form__note", form);
      if (note) {
        note.className = "form__note is-ok";
        note.textContent = win ? "Thank you! WhatsApp has opened with your details — just press send." : "Thank you! Tap the WhatsApp button to send your details.";
      }
      form.reset();
    });
  });
})();
