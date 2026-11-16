/* Raja's Martial Arts — site behaviour. Every lookup is null-guarded. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var C = window.RAJA || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function waLink(text) {
    var num = String(C.whatsapp || "").replace(/\D/g, "");
    return "https://wa.me/" + num + (text ? "?text=" + encodeURIComponent(text) : "");
  }

  /* ---------- year ---------- */
  var yr = $("#yr");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- WhatsApp links ---------- */
  $$("[data-wa]").forEach(function (a) {
    a.href = waLink(a.getAttribute("data-wa"));
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* ---------- contact details from config ---------- */
  var addr = C.address || {};
  var addrText = [addr.line1, addr.city, addr.country].filter(Boolean).join(", ");
  $$("[data-bind]").forEach(function (el) {
    var key = el.getAttribute("data-bind");
    if (key === "phoneDisplay" && C.phoneDisplay) el.textContent = C.phoneDisplay;
    if (key === "address" && addrText) el.textContent = addrText;
    if (key === "email" && C.email) {
      el.textContent = C.email;
      el.href = "mailto:" + C.email;
      var row = el.closest(".contact__email");
      if (row) row.hidden = false;
    }
  });

  /* ---------- social icons ---------- */
  var ICONS = {
    instagram: '<path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4ZM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4ZM21.9 7c-.1-1.6-.4-3-1.6-4.2C19.1 1.6 17.6 1.2 16 1.1 14.4 1 9.6 1 8 1.1 6.4 1.2 5 1.5 3.7 2.7S2.1 5.4 2 7c-.1 1.6-.1 6.4 0 8 .1 1.6.4 3 1.6 4.2s2.7 1.6 4.3 1.7c1.6.1 6.4.1 8 0 1.6-.1 3-.4 4.3-1.7 1.2-1.2 1.6-2.6 1.6-4.2.1-1.6.1-6.4.1-8Zm-2.1 9.8a3.2 3.2 0 0 1-1.8 1.8c-1.3.5-4.3.4-5.6.4s-4.4.1-5.6-.4a3.2 3.2 0 0 1-1.8-1.8c-.5-1.3-.4-4.3-.4-5.6s-.1-4.4.4-5.6A3.2 3.2 0 0 1 6.8 3.8C8 3.3 11 3.4 12.4 3.4s4.4-.1 5.6.4a3.2 3.2 0 0 1 1.8 1.8c.5 1.3.4 4.3.4 5.6s.1 4.4-.4 5.6Z"/>',
    facebook: '<path d="M14 8V6.2c0-.8.2-1.2 1.4-1.2H17V2h-2.6C11.3 2 10 3.6 10 6.1V8H8v3h2v11h4V11h2.7l.3-3h-3Z"/>',
    youtube: '<path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.8 15V9l5.8 3-5.8 3Z"/>'
  };
  var social = $("#social");
  if (social) {
    Object.keys(ICONS).forEach(function (k) {
      if (!C[k]) return;
      var a = document.createElement("a");
      a.href = C[k]; a.target = "_blank"; a.rel = "noopener";
      a.setAttribute("aria-label", k.charAt(0).toUpperCase() + k.slice(1));
      a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[k] + "</svg>";
      social.appendChild(a);
    });
  }

  /* ---------- photos: drop a file in assets/img and it replaces the placeholder ---------- */
  $$(".slot[data-file]").forEach(function (slot) {
    var src = slot.getAttribute("data-file");
    var img = new Image();
    img.onload = function () {
      var label = $(".slot__label", slot);
      img.alt = slot.getAttribute("data-alt") || (label ? label.textContent.replace(/\.\w+.*$/, "").replace(/-/g, " ") : "");
      img.loading = "lazy";
      img.decoding = "async";
      slot.appendChild(img);
      slot.classList.add("has-img");
    };
    img.src = src;
  });

  /* ---------- mobile menu ---------- */
  var burger = $("#burger"), panel = $("#panel");
  function closeMenu() {
    if (!burger || !panel) return;
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
    panel.hidden = true;
  }
  if (burger && panel) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      burger.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      panel.hidden = open;
    });
    $$("a", panel).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 900) closeMenu(); });
  }

  /* ---------- nav border + belt spine + active link ---------- */
  var nav = $("#nav"), fill = $("#spineFill");
  var links = $$(".nav__links a");
  var sections = links.map(function (a) { return $(a.getAttribute("href")); });
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle("is-scrolled", y > 8);
    if (fill) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      fill.style.height = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + "%";
    }
    var current = -1;
    sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < window.innerHeight * 0.4) current = i; });
    links.forEach(function (a, i) { a.classList.toggle("is-active", i === current); });
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- scroll reveal ---------- */
  var rv = $$(".rv");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- map ---------- */
  var mapEl = $("#map");
  function initMap() {
    if (!mapEl || typeof C.lat !== "number" || typeof C.lng !== "number" || !window.L) return;
    mapEl.innerHTML = "";
    var map = L.map(mapEl, { scrollWheelZoom: false }).setView([C.lat, C.lng], 16);
    var dark = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19, attribution: '&copy; OpenStreetMap &copy; CARTO'
    });
    dark.on("tileerror", function () {
      if (map.hasLayer(dark)) {
        map.removeLayer(dark);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap" }).addTo(map);
      }
    });
    dark.addTo(map);
    var icon = L.divIcon({
      className: "",
      html: '<div style="width:22px;height:22px;background:#D5121F;border:3px solid #EDE9E3;border-radius:50%;box-shadow:0 0 0 6px rgba(213,18,31,.25)"></div>',
      iconSize: [22, 22], iconAnchor: [11, 11]
    });
    L.marker([C.lat, C.lng], { icon: icon }).addTo(map)
      .bindPopup("<b>Raja's Martial Arts</b><br>" + (addrText || ""));
  }
  if (document.readyState === "complete") initMap();
  else window.addEventListener("load", initMap);

  /* ---------- join form → Netlify Forms + WhatsApp ---------- */
  var form = $("#joinForm"), note = $("#formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      var msg = [
        "Assalam o Alaikum! I'd like to book a free trial class.",
        "",
        "Name: " + (d.get("name") || ""),
        "Phone: " + (d.get("phone") || ""),
        d.get("age") ? "Age: " + d.get("age") : null,
        "Program: " + (d.get("program") || ""),
        d.get("message") ? "Note: " + d.get("message") : null
      ].filter(function (l) { return l !== null; }).join("\n");

      // Open WhatsApp right away (inside the click) so pop-up blockers allow it
      var win = window.open(waLink(msg), "_blank", "noopener");

      // Save a copy in Netlify Forms (works once deployed on Netlify)
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(d).toString()
      }).catch(function () {});

      if (note) {
        note.className = "form__note is-ok";
        note.textContent = win ? "Thanks! WhatsApp has opened with your details. Just press send." : "Thanks! Tap the green WhatsApp button to send your details.";
      }
      form.reset();
    });
  }
})();
