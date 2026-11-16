/* Raja's Martial Arts — motion layer (GSAP + ScrollTrigger).
   Everything here is optional polish: if GSAP doesn't load, or the visitor
   prefers reduced motion, the site works exactly the same without it. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function clearCurtain() { root.classList.remove("is-entering"); try { sessionStorage.removeItem("rma-nav"); } catch (e) {} }

  if (reduce || !window.gsap) { clearCurtain(); return; }
  var gsap = window.gsap;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
  var ST = window.ScrollTrigger;
  root.classList.add("gsap-on");
  gsap.defaults({ ease: "power3.out", duration: 0.9 });

  /* ---------- helpers ---------- */
  // Wrap every word in a mask so it can rise into view, keeping inner tags (like <span class="red">).
  function splitWords(el) {
    if (!el || el.dataset.split) return [];
    el.dataset.split = "1";
    var out = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var m = document.createElement("span"); m.className = "w";
            var i = document.createElement("span"); i.className = "wi"; i.textContent = p;
            m.appendChild(i); frag.appendChild(m); out.push(i);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    })(el);
    return out;
  }
  function splitChars(el) {
    if (!el || el.dataset.split) return [];
    el.dataset.split = "1";
    var chars = Array.from(el.textContent);
    el.textContent = "";
    return chars.map(function (c) { var s = document.createElement("span"); s.className = "ch"; s.textContent = c; el.appendChild(s); return s; });
  }

  /* ---------- page curtain (enter + leave) ---------- */
  var curtain = $(".curtain");
  if (curtain) {
    if (root.classList.contains("is-entering")) {
      gsap.to(curtain, { yPercent: -100, duration: 0.8, ease: "power4.inOut", delay: 0.1, onComplete: function () {
        clearCurtain(); gsap.set(curtain, { clearProps: "transform" });
      } });
    }
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
      if (url.pathname === location.pathname) return; // same-page anchors scroll normally
      e.preventDefault();
      try { sessionStorage.setItem("rma-nav", "1"); } catch (err) {}
      gsap.fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: 0.55, ease: "power4.inOut", onComplete: function () { location.href = a.href; } });
    });
    // coming back with the browser's back button: make sure the curtain is gone
    window.addEventListener("pageshow", function (e) { if (e.persisted) { gsap.set(curtain, { clearProps: "transform" }); clearCurtain(); } });
  }

  /* ---------- scroll progress bar ---------- */
  var bar = document.createElement("div"); bar.className = "progress"; document.body.appendChild(bar);
  if (ST) gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

  /* ---------- header drops in ---------- */
  gsap.from(".hdr__in > *", { y: -24, opacity: 0, duration: 0.7, stagger: 0.06, delay: 0.15, clearProps: "transform,opacity" });

  /* ---------- hero intro ---------- */
  var hero = $(".hero, .term-hero");
  var heroH1 = hero ? $("h1", hero) : $(".belt-aside h1");
  var tl = gsap.timeline({ delay: root.classList.contains("is-entering") ? 0.55 : 0.2 });
  if (heroH1) {
    var words = splitWords(heroH1);
    var holder = heroH1.closest(".hero__copy, .term-hero__copy, .belt-aside") || heroH1.parentNode;
    var eyebrow = $(".eyebrow, .crumbs", holder);
    if (eyebrow) tl.from(eyebrow, { x: -30, opacity: 0, duration: 0.6 }, 0);
    tl.from(words, { yPercent: 110, rotate: 4, duration: 1, stagger: 0.06, ease: "power4.out" }, 0.1);
    var rest = $$(":scope > :not(h1):not(.eyebrow):not(.crumbs)", holder);
    if (rest.length) tl.from(rest, { y: 24, opacity: 0, stagger: 0.08, duration: 0.8 }, 0.5);
  }
  if (hero) {
    var art = $(".hero__art .ph", hero);
    if (art) tl.from(art, { y: 60, opacity: 0, scale: 0.94, duration: 1.2, ease: "expo.out" }, 0.2);
    var ring = $(".hero__ring", hero);
    if (ring) {
      tl.from(ring, { scale: 0.6, opacity: 0, duration: 1.4, ease: "expo.out" }, 0.1);
      gsap.to(ring, { rotate: 360, duration: 60, repeat: -1, ease: "none" });
    }
    var quote = $(".hero__art .quote-hand", hero);
    if (quote) tl.from(quote, { opacity: 0, x: 30, rotate: -4, duration: 1 }, 0.9);
  }
  // kanji characters fall in one by one, everywhere they appear
  $$(".kanji").forEach(function (k, idx) {
    var chars = splitChars(k);
    var inHero = !!k.closest(".hero, .term-hero");
    var vars = { y: -40, opacity: 0, filter: "blur(6px)", duration: 0.9, stagger: 0.18, ease: "power2.out" };
    if (inHero) tl.from(chars, vars, 0.4);
    else if (ST) gsap.from(chars, Object.assign(vars, { scrollTrigger: { trigger: k, start: "top 85%" } }));
  });

  if (!ST) { clearCurtain(); return; }

  /* ---------- parallax ---------- */
  $$(".hero").forEach(function (h) {
    var a = $(".hero__art .ph", h), k = $(".hero__art .kanji", h), c = $(".hero__copy", h);
    var st = { trigger: h, start: "top top", end: "bottom top", scrub: true };
    if (a) gsap.to(a, { yPercent: 12, ease: "none", scrollTrigger: st });
    if (k) gsap.to(k, { yPercent: -40, ease: "none", scrollTrigger: st });
    if (c) gsap.to(c, { yPercent: 10, opacity: 0.4, ease: "none", scrollTrigger: st });
  });
  $$(".wash").forEach(function (w) {
    gsap.to(w, { yPercent: 18, ease: "none", scrollTrigger: { trigger: w.parentNode, start: "top top", end: "bottom top", scrub: true } });
  });
  // big background photos drift slower than the page
  $$(".video-band > .ph, .testi > .ph, .sched-wrap > .ph, .final > .ph, .master > .ph, .term-hero > .ph").forEach(function (p) {
    gsap.fromTo(p, { scale: 1.15, yPercent: -6 }, { scale: 1, yPercent: 6, ease: "none",
      scrollTrigger: { trigger: p.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* ---------- section headings: words rise, eyebrow line draws ---------- */
  $$("main h2").forEach(function (h) {
    if (h.closest(".hero, .term-hero, .trial, .choose, .bar-cta")) return;
    var w = splitWords(h);
    gsap.from(w, { yPercent: 110, duration: 0.9, stagger: 0.04, ease: "power4.out", scrollTrigger: { trigger: h, start: "top 88%" } });
  });
  $$("main .eyebrow").forEach(function (e) {
    if (e.closest(".hero, .term-hero")) return;
    gsap.from(e, { opacity: 0, x: -20, duration: 0.7, scrollTrigger: { trigger: e, start: "top 90%" } });
  });

  /* ---------- generic reveals (cards, rows, tiles) ---------- */
  var groups = [
    ".grid > *", ".perks > *", ".age-tiles > *", ".timeline > *", ".values > *", ".media > *",
    ".mtc__items > *", ".steps > li", ".fees > *", ".mods > li", ".loc-list > li", ".mosaic > *",
    ".faq > details", ".sched tbody tr", ".ticks > li", ".crit > li", ".welcome__item", ".coach-card",
    ".ftr__top > *", ".contact-list > li"
  ];
  ST.batch(groups.join(","), {
    start: "top 90%",
    onEnter: function (els) { gsap.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.8, overwrite: true }); }
  });
  // anything else that used the CSS reveal
  var groupSel = groups.join(",");
  $$(".rv").forEach(function (el) {
    if (el.matches(groupSel)) return;
    gsap.fromTo(el, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, scrollTrigger: { trigger: el, start: "top 88%" } });
  });

  /* ---------- photos: clip-path wipe on enter ---------- */
  $$(".two > .ph, .split .age-tiles, .syl-art .ph, .coach .ph, .course .ph, .tl .ph").forEach(function (p) {
    gsap.fromTo(p, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: p, start: "top 88%" } });
  });

  /* ---------- counters (25+, 500+, 3 …) ---------- */
  $$(".stat b").forEach(function (b) {
    var m = b.textContent.match(/^(\d+)(.*)$/);
    if (!m) return;
    var end = +m[1], suf = m[2], o = { v: 0 };
    b.textContent = "0" + suf;
    gsap.to(o, { v: end, duration: 1.8, ease: "power2.out", delay: 0.6,
      scrollTrigger: { trigger: b, start: "top 95%" },
      onUpdate: function () { b.textContent = Math.round(o.v) + suf; } });
  });

  /* ---------- belt test: belts swing in, a red line follows your progress ---------- */
  $$(".belt-row").forEach(function (row) {
    var pic = $(".belt-pic", row);
    var t = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 85%" } });
    if (pic) t.from(pic, { x: -80, rotate: -25, opacity: 0, duration: 1, ease: "back.out(1.6)" });
    t.from($$(".belt-name > *, p", row), { y: 20, opacity: 0, stagger: 0.07, duration: 0.6 }, "-=0.6");
  });
  var beltList = $(".belt-list");
  if (beltList) {
    var line = document.createElement("span"); line.className = "belt-line"; beltList.appendChild(line);
    gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: beltList, start: "top 70%", end: "bottom 60%", scrub: true } });
  }

  /* ---------- course cards: icon pops ---------- */
  $$(".course .ico--ring, .welcome__item .ico, .value .ico").forEach(function (i) {
    gsap.from(i, { scale: 0, rotate: -90, duration: 0.8, ease: "back.out(2)", scrollTrigger: { trigger: i, start: "top 92%" } });
  });

  /* ---------- marquee ---------- */
  $$(".marquee__track").forEach(function (t) {
    var tw = gsap.to(t, { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
    // scrolling speeds it up and flips direction with the scroll
    ST.create({ onUpdate: function (self) {
      var v = self.getVelocity() / 300;
      gsap.to(tw, { timeScale: (self.direction === 1 ? 1 : -1) * Math.max(1, Math.min(5, Math.abs(v))), duration: 0.3, overwrite: true });
    } });
  });

  /* ---------- terminology slider: animate each change ---------- */
  document.addEventListener("term:change", function (e) {
    var cat = e.target, dir = e.detail && e.detail.dir || 1;
    var main = $(".term-main", cat), info = $(".term-info", cat);
    if (main) gsap.fromTo(main, { clipPath: dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0%)", duration: 0.7, ease: "expo.out" });
    if (info) gsap.fromTo(info.children, { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.5 });
  });

  /* ---------- magnetic buttons + custom cursor (mouse only) ---------- */
  if (finePointer) {
    $$("main .btn--red, .play, .wa-float, .carousel__btn, .term-side .arrow").forEach(function (b) {
      var xTo = gsap.quickTo(b, "x", { duration: 0.4, ease: "power3" }), yTo = gsap.quickTo(b, "y", { duration: 0.4, ease: "power3" });
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25); yTo((e.clientY - r.top - r.height / 2) * 0.3);
      });
      b.addEventListener("mouseleave", function () { xTo(0); yTo(0); });
    });

    var dot = document.createElement("div"), ringEl = document.createElement("div");
    dot.className = "cursor-dot"; ringEl.className = "cursor-ring"; ringEl.innerHTML = "<span></span>";
    document.body.appendChild(ringEl); document.body.appendChild(dot);
    root.classList.add("has-cursor");
    var label = ringEl.firstChild;
    gsap.set([dot, ringEl], { xPercent: -50, yPercent: -50, opacity: 0 });
    var dx = gsap.quickTo(dot, "x", { duration: 0.08 }), dy = gsap.quickTo(dot, "y", { duration: 0.08 });
    var rx = gsap.quickTo(ringEl, "x", { duration: 0.45, ease: "power3" }), ry = gsap.quickTo(ringEl, "y", { duration: 0.45, ease: "power3" });
    var shown = false;
    window.addEventListener("mousemove", function (e) {
      if (!shown) { shown = true; gsap.to([dot, ringEl], { opacity: 1, duration: 0.3 }); }
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    });
    document.addEventListener("mouseleave", function () { shown = false; gsap.to([dot, ringEl], { opacity: 0, duration: 0.3 }); });
    window.addEventListener("mousedown", function () { gsap.to(ringEl, { scale: 0.8, duration: 0.15 }); });
    window.addEventListener("mouseup", function () { gsap.to(ringEl, { scale: 1, duration: 0.3 }); });
    document.addEventListener("mouseover", function (e) {
      var t = e.target;
      var field = t.closest && t.closest("input, textarea, select");
      var play = t.closest && t.closest(".play, [data-video]");
      var hot = t.closest && t.closest("a, button, summary, label, .term-side, .coach-card");
      root.classList.toggle("cursor-field", !!field);
      ringEl.classList.toggle("is-hot", !!hot && !play && !field);
      ringEl.classList.toggle("is-play", !!play);
      label.textContent = play ? "Play" : "";
    });
  }

  // make sure positions are right once fonts and images settle
  window.addEventListener("load", function () { ST.refresh(); });
})();
