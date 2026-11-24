#!/usr/bin/env python3
"""Generates the Raja's Martial Arts pages with one shared header/footer."""
import sys, os, html
OUT = sys.argv[1]

I = {  # stroke icons, 24x24
 "user":'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
 "users":'<circle cx="9" cy="8" r="3.5"/><path d="M2 20c.8-3.5 3.5-5 7-5s6.2 1.5 7 5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2 .6 3.4 2.2 4 5"/>',
 "medal":'<circle cx="12" cy="15" r="6"/><path d="M8 3h8l-2 6h-4z"/><path d="m12 12 1 2 2 .3-1.5 1.4.4 2.1L12 17l-1.9 1 .4-2.2L9 14.3l2-.3z"/>',
 "fist":'<path d="M6 11V7a2 2 0 0 1 4 0v3M10 10V6a2 2 0 0 1 4 0v4M14 10V7a2 2 0 0 1 4 0v6a7 7 0 0 1-7 7H10a5 5 0 0 1-5-5v-2a2 2 0 0 1 4 0"/>',
 "shield":'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
 "heart":'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/><path d="M8 12h2l1-2 2 4 1-2h2"/>',
 "brain":'<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1Z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
 "flame":'<path d="M12 21a6 6 0 0 0 6-6c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-3 5-3 8a6 6 0 0 0 6 6Z"/>',
 "clock":'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 "cal":'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 "pin":'<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
 "phone":'<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z"/>',
 "mail":'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
 "book":'<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
 "target":'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
 "star":'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
 "temple":'<path d="M3 7h18M5 7l1-3h12l1 3M6 11h12M7 11v9M17 11v9M4 20h16M10 15h4"/>',
 "lotus":'<path d="M12 20c-4 0-8-2-9-6 3 0 6 1 9 4 3-3 6-4 9-4-1 4-5 6-9 6Z"/><path d="M12 18c-2-3-2-7 0-11 2 4 2 8 0 11Z"/>',
 "check":'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
 "chart":'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
 "dumbbell":'<path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12"/>',
 "eye":'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
 "hands":'<path d="M8 13 4 9a2 2 0 0 1 3-3l5 5M16 13l4-4a2 2 0 0 0-3-3l-5 5M8 13l4 4 4-4"/>',
 "arrow":'<path d="M5 12h14M13 6l6 6-6 6"/>',
 "left":'<path d="M15 5l-7 7 7 7"/>', "right":'<path d="M9 5l7 7-7 7"/>',
}
def ic(n, cls="ico"): return f'<span class="{cls}"><svg viewBox="0 0 24 24" aria-hidden="true">{I[n]}</svg></span>'
def svg(n): return f'<svg viewBox="0 0 24 24" aria-hidden="true">{I[n]}</svg>'
ARROW = f'<svg viewBox="0 0 24 24" aria-hidden="true">{I["arrow"]}</svg>'
PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>'
def ph(file, cls="", alt=None, tag="div", extra=""):
    a = html.escape(alt if alt is not None else file.rsplit(".",1)[0].replace("-"," "))
    return f'<{tag} class="ph {cls}" data-file="{file}"{extra}><img src="assets/img/{file}" alt="{a}" loading="lazy"></{tag}>'

NAV = [("index.html","Home"),("biography.html","About"),("instructors.html","Instructors"),("courses.html","Courses"),
       ("syllabus.html","Syllabus"),("belt-test.html","Belt Test"),("terminology.html","Terminology"),("index.html#contact","Contact")]
WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.3-.5 0-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.1 1.4Z"/></svg>'
SOC = {
 "facebook":'<path d="M14 8V6.2c0-.8.2-1.2 1.4-1.2H17V2h-2.6C11.3 2 10 3.6 10 6.1V8H8v3h2v11h4V11h2.7l.3-3h-3Z"/>',
 "instagram":'<path d="M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM16.3 2H7.7A5.7 5.7 0 0 0 2 7.7v8.6A5.7 5.7 0 0 0 7.7 22h8.6a5.7 5.7 0 0 0 5.7-5.7V7.7A5.7 5.7 0 0 0 16.3 2Zm3.9 14.3a3.9 3.9 0 0 1-3.9 3.9H7.7a3.9 3.9 0 0 1-3.9-3.9V7.7a3.9 3.9 0 0 1 3.9-3.9h8.6a3.9 3.9 0 0 1 3.9 3.9Z"/>',
 "youtube":'<path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.8 15V9l5.8 3-5.8 3Z"/>'}

_ARROW = ("url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E"
          "%3Cpath d='M4 3l19 8.2-8 2.4-3.6 8.4z' fill='%23E01E26' stroke='%23141416' stroke-width='2' stroke-linejoin='round'/%3E"
          "%3Cpath d='M6.6 6.4l11 4.8-4.7 1.4' fill='none' stroke='%23fff' stroke-opacity='.55' stroke-width='1.2' stroke-linecap='round'/%3E%3C/svg%3E\") 4 3")
# One cursor for the whole page, set before anything else loads, so it never flickers or swaps.
CURSOR_CSS = ("<style>@media (hover:hover) and (pointer:fine){"
              "html,body,*,*::before,*::after{cursor:" + _ARROW + ",auto!important}"
              "a,a *,button,button *,summary,label,select,[role=button],.term-side,.coach-card,.play{cursor:" + _ARROW + ",pointer!important}"
              "input:not([type=submit]):not([type=button]),textarea{cursor:text!important}}</style>")
HEADJS = '<script>try{if(sessionStorage.getItem("rma-nav")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("is-entering");setTimeout(function(){document.documentElement.classList.remove("is-entering")},2500)}}catch(e){}</script>'
LOGO = '<span class="logo__img"><img src="assets/img/logo.png" alt=""></span><span class="logo__txt"><b>Raja\'s</b><small>Martial Arts &amp; Fitness Gym</small></span>'

def page(fname, title, desc, body, dark_top=False, cls=None, cur=None):
    cur = cur or fname
    AC = ' aria-current="page"'
    links = "".join(f'<a href="{h}"{AC if h==cur else ""}>{t}</a>' for h,t in NAV)
    soc = "".join(f'<a data-social="{k}" href="#" aria-label="{k.title()}"><svg viewBox="0 0 24 24" aria-hidden="true">{v}</svg></a>' for k,v in SOC.items())
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#0C0C0E">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="assets/img/og-cover.jpg">
<link rel="icon" href="assets/img/favicon.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Inter:wght@400;500;600;700&family=Noto+Serif:wght@600;700;800;900&family=Oswald:wght@500;600;700&family=Yuji+Syuku&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/styles.css">
<script>if("scrollRestoration" in history)history.scrollRestoration="manual"</script>
{CURSOR_CSS}
{HEADJS}
</head>
<body class="page-{cls or ('home' if fname=='index.html' else fname[:-5])}{' dark-top' if dark_top else ''}">
<div class="curtain" aria-hidden="true"></div>
<a class="skip" href="#main">Skip to content</a>
<header class="hdr">
  <div class="wrap hdr__in">
    <a class="logo" href="index.html" aria-label="Raja's Martial Arts — home">{LOGO}</a>
    <nav class="menu" aria-label="Main">{links}</nav>
    <a class="btn btn--red btn--sm hdr__cta" href="index.html#trial">Book Free Trial</a>
    <button class="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="drawer"><span></span><span></span></button>
  </div>
  <nav class="drawer" id="drawer" aria-label="Mobile" hidden>{links}<a class="btn btn--red btn--full" href="index.html#trial">Book Free Trial</a></nav>
</header>
<main id="main">
{body}
</main>
<footer class="ftr on-dark">
  <div class="wrap ftr__top">
    <div>
      <a class="logo" href="index.html">{LOGO}</a>
      <p class="ftr__about">I.K.O So-Kyokushin karate and fitness under Shihan Raja Khalid Mehmood Janjua. Fight · Discipline · Fitness.</p>
      <div class="social">{soc}</div>
    </div>
    <div><h4>Explore</h4><ul><li><a href="biography.html">About Shihan</a></li><li><a href="instructors.html">Instructors</a></li><li><a href="courses.html">Courses &amp; Fees</a></li><li><a href="syllabus.html">Syllabus</a></li></ul></div>
    <div><h4>Learn</h4><ul><li><a href="belt-test.html">Belt Test</a></li><li><a href="terminology.html">Terminology</a></li><li><a href="index.html#schedule">Class Schedule</a></li><li><a href="index.html#faq">FAQ</a></li></ul></div>
    <div><h4>Visit</h4><ul class="contact-list">
      <li>{svg("pin")}<span data-bind="address">Address coming soon</span></li>
      <li>{svg("phone")}<a data-wa="" href="#" data-bind="phone">WhatsApp</a></li>
      <li>{svg("mail")}<a data-bind="email" href="#">—</a></li></ul></div>
  </div>
  <div class="wrap ftr__base"><span>© <span class="js-year">2026</span> Raja's Martial Arts &amp; Fitness Gym. All rights reserved.</span><span>押忍 · OSU</span></div>
</footer>
<a class="wa-float" data-wa="Assalam o Alaikum! I'd like to know more about classes." href="#" aria-label="Chat on WhatsApp">{WA_ICON}</a>
<script src="assets/js/config.js" defer></script>
<script src="assets/js/main.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
<script src="assets/js/animations.js" defer></script>
</body>
</html>
'''

def trial_form(fid="trial"):
    return f'''<form class="card trial form" data-trial name="trial" method="POST" data-netlify="true" netlify-honeypot="bot-field">
  <input type="hidden" name="form-name" value="trial"><p hidden><label>Skip <input name="bot-field"></label></p>
  <h3>Book a Free Trial</h3>
  <div class="field"><label for="{fid}-name">Full name</label><input id="{fid}-name" name="name" autocomplete="name" required></div>
  <div class="row2">
    <div class="field"><label for="{fid}-phone">Phone / WhatsApp</label><input id="{fid}-phone" name="phone" type="tel" autocomplete="tel" required></div>
    <div class="field"><label for="{fid}-age">Age</label><input id="{fid}-age" name="age" type="number" min="3" max="99" inputmode="numeric"></div>
  </div>
  <div class="field"><label for="{fid}-course">Course</label><select id="{fid}-course" name="course">
    <option>Kyokushin Karate</option><option>Self Defense</option><option>Weight Loss</option><option>Mental Health &amp; Focus</option><option>Kickboxing</option><option>Personal Training (1-on-1)</option><option>Family membership</option><option>Not sure yet</option></select></div>
  <div class="field"><label for="{fid}-time">Preferred time</label><select id="{fid}-time" name="time">
    <option>Female class (10:00 am – 12:30 pm)</option><option>Kids &amp; teens (4:00 – 6:00 pm)</option><option selected>Mixed class (6:00 – 8:00 pm)</option><option>Kickboxing &amp; boxing (9:00 – 10:30 pm)</option><option>Personal training (by appointment)</option></select></div>
  <button class="btn btn--red btn--full" type="submit">Submit {ARROW}</button>
  <p class="form__note" role="status" aria-live="polite">We'll reply on WhatsApp to confirm your class.</p>
</form>'''

CTA = lambda h, p, btn="Book Free Trial", href="index.html#trial": f'''<section class="cta-band on-dark"><div class="wrap cta-band__in"><div><h2 class="h-md">{h}</h2><p>{p}</p></div><a class="btn btn--red" href="{href}">{btn} {ARROW}</a></div></section>'''

# =====================================================================  HOME
home = f'''
<section class="hero hero--light home-hero">
  <div class="wrap hero__grid">
    <div class="hero__copy">
      <p class="eyebrow">I.K.O So-Kyokushin · Fight · Discipline · Fitness</p>
      <h1 class="sans">More than<br>just a <span class="red">martial art</span></h1>
      <p class="lede">Kyokushin Karate under Shihan Raja Khalid Mehmood Janjua — a renowned, verified instructor. Build strength, discipline and the confidence to carry yourself anywhere.</p>
      <div><a class="btn btn--red" href="#trial">Start your journey {ARROW}</a></div>
    </div>
    <div class="hero__art">
      {ph("hero-home.jpg","ph--photo ph--hero","Kyokushin instructor in a white blazer with both fists raised in a karate guard")}
      <div class="kanji" aria-hidden="true">極真会</div>
    </div>
  </div>
</section>

<section class="video-band" data-video-box aria-label="Dojo video">
  {ph("video-poster.jpg","ph--dark","A Kyokushin student in stance in the dojo")}
  <button class="play" type="button" data-video="assets/video/intro.mp4" aria-label="Play dojo video">{PLAY}</button>
  <p class="video-band__cap">Watch · Inside the dojo</p>
</section>

<div class="marquee" aria-hidden="true"><div class="marquee__track"><span>Fight</span><span>•</span><span>Discipline</span><span>•</span><span>Fitness</span><span>•</span><b>押忍</b><span>Kyokushin</span><span>•</span><span>Osu</span><span>•</span><b>極真会</b><span>Fight</span><span>•</span><span>Discipline</span><span>•</span><span>Fitness</span><span>•</span><b>押忍</b><span>Kyokushin</span><span>•</span><span>Osu</span><span>•</span><b>極真会</b><span>Fight</span><span>•</span><span>Discipline</span><span>•</span><span>Fitness</span><span>•</span><b>押忍</b><span>Kyokushin</span><span>•</span><span>Osu</span><span>•</span><b>極真会</b><span>Fight</span><span>•</span><span>Discipline</span><span>•</span><span>Fitness</span><span>•</span><b>押忍</b><span>Kyokushin</span><span>•</span><span>Osu</span><span>•</span><b>極真会</b></div></div>

<section class="sec" id="trial">
  <div class="wrap first-step">
    <div class="rv">
      <p class="eyebrow">Join the dojo</p>
      <h2 style="margin-top:14px">Take the first step<br><span class="red">towards a stronger you</span></h2>
      <p class="lede" style="margin-top:16px">Your first class is free. No experience and no gi needed — just come in comfortable clothes and we'll guide you from the very first bow.</p>
      <div class="perks">
        <div class="perk">{ic("medal")}<b>Expert guidance</b><span>Certified Kyokushin black belts</span></div>
        <div class="perk">{ic("dumbbell")}<b>Strength &amp; fitness</b><span>Conditioning in every class</span></div>
        <div class="perk">{ic("lotus")}<b>Lifelong discipline</b><span>Respect, focus and spirit</span></div>
      </div>
    </div>
    <div class="rv">{trial_form()}</div>
  </div>
</section>

<section class="page-dark on-dark" style="padding-top:clamp(80px,9vw,120px)">
  <div class="wrap">
    <div class="welcome rv">
      <div class="sec-head sec-head--c" style="margin:0">
        <p class="eyebrow eyebrow--c">Welcome to Raja's Martial Arts</p>
        <h2 class="h-lg">A dojo built on <span class="red">Kyokushin spirit</span></h2>
        <p class="lede">From the founder's story to your first belt test, everything here is designed to turn hard work into real progress.</p>
      </div>
      <div class="grid g3">
        <div class="welcome__item">{ic("user")}<h3>Meet the Shihan</h3><p>Learn the story behind the dojo and the man who built it.</p><a class="link" style="color:#fff" href="biography.html">His story</a></div>
        <div class="welcome__item">{ic("users")}<h3>Our Instructors</h3><p>Verified black belts who know every student by name.</p><a class="link" style="color:#fff" href="instructors.html">Meet them</a></div>
        <div class="welcome__item">{ic("medal")}<h3>Become a Member</h3><p>PKR 8,000 a month, PKR 7,000 for families.</p><a class="link" style="color:#fff" href="courses.html#fees">See fees</a></div>
      </div>
    </div>

    <div class="split sec">
      <div class="rv">
        <p class="eyebrow">Programs for every age</p>
        <h2 class="h-lg" style="margin:14px 0 16px">Kyokushin is the best <span class="red">self-defense training</span> for you</h2>
        <p class="lede">Real full-contact karate taught safely and step by step. Kids gain focus and confidence, adults gain fitness and the ability to protect themselves.</p>
        <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:24px"><a class="btn btn--red" href="courses.html">View courses {ARROW}</a><a class="btn btn--line" href="syllabus.html">Syllabus</a></div>
      </div>
      <div class="age-tiles rv">
        <a class="age" href="courses.html">{ph("age-kids.jpg","ph--dark","Kids karate class")}<span class="age__cap"><b>4–7 Years</b><span>Little Warriors</span></span></a>
        <a class="age" href="courses.html">{ph("age-juniors.jpg","ph--dark","Junior karate class")}<span class="age__cap"><b>8–12 Years</b><span>Juniors</span></span></a>
        <a class="age" href="courses.html">{ph("age-teens.jpg","ph--dark","Teen karate class")}<span class="age__cap"><b>13–17 Years</b><span>Teens</span></span></a>
        <a class="age" href="courses.html">{ph("age-adults.jpg","ph--dark","Adult karate class")}<span class="age__cap"><b>Adults</b><span>18 and over</span></span></a>
      </div>
    </div>
  </div>
</section>

<section class="sched-wrap on-dark sec" id="schedule">
  {ph("schedule-bg.jpg","ph--dark","")}
  <div class="wrap" style="position:relative">
    <div class="sec-head sec-head--c rv">
      <p class="eyebrow eyebrow--c">Daily schedule</p>
      <h2 class="h-lg">Class <span class="red">timings</span></h2>
      <p class="lede">Pick the class that fits you. Message us on WhatsApp to confirm your days before your first visit.</p>
    </div>
    <div class="sched rv" role="region" aria-label="Class timings" tabindex="0">
      <table style="min-width:520px">
        <thead><tr><th scope="col">Class</th><th scope="col">Time</th><th scope="col">For</th></tr></thead>
        <tbody>
          <tr><th scope="row">Female class</th><td><b>10:00 am – 12:30 pm</b>Morning</td><td>Women &amp; girls only</td></tr>
          <tr><th scope="row">Kids &amp; teens</th><td><b>4:00 – 6:00 pm</b>Afternoon</td><td>Children and teenagers</td></tr>
          <tr><th scope="row">Mixed class</th><td><b>6:00 – 8:00 pm</b>Evening</td><td>Everyone — all ages &amp; levels</td></tr>
          <tr><th scope="row">Kickboxing &amp; boxing</th><td><b>9:00 – 10:30 pm</b>Night</td><td>Teens &amp; adults</td></tr>
          <tr><th scope="row">Personal training</th><td><b>By appointment</b>Slot set with your coach</td><td>1-on-1, any course</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

<section class="sec page-dark on-dark" id="faq">
  <div class="wrap">
    <div class="sec-head sec-head--c rv">
      <p class="eyebrow eyebrow--c">Questions</p>
      <h2 class="h-lg">Kyokushin <span class="red">FAQ</span></h2>
    </div>
    <div class="faq rv">
      <details><summary>Do I need any experience to join?</summary><p>No. Most students start as complete beginners. Your first classes focus on basics, stances and fitness at your own pace.</p></details>
      <details><summary>Is Kyokushin safe for children?</summary><p>Yes. Kids train without full contact, with close supervision, padding and age-appropriate drills that build coordination and confidence.</p></details>
      <details><summary>What should I wear to the free trial?</summary><p>Comfortable sports clothes and a water bottle. You can buy a gi once you decide to join.</p></details>
      <details><summary>How much are the monthly fees?</summary><p>Admission is PKR 5,000 (one-time) and the monthly fee is PKR 8,000. Families pay PKR 7,000 per member. The gi (uniform) is PKR 5,000 and personal 1-on-1 training is PKR 25,000. See the Courses page for details.</p></details>
      <details><summary>How often are belt tests held?</summary><p>Gradings are held regularly once a student has met the time and syllabus requirements for the next belt. See the Belt Test page.</p></details>
      <details><summary>Are there classes for women?</summary><p>Yes. There is a female-only morning class from 10:00 am to 12:30 pm, and women are also welcome in the mixed class (6:00 – 8:00 pm).</p></details>
      <details><summary>Will karate help me lose weight?</summary><p>Yes. Kyokushin training is high intensity. Our weight loss course combines karate conditioning with strength and circuit work.</p></details>
      <details><summary>Is the dojo affiliated?</summary><p>Yes. Raja's Martial Arts &amp; Fitness Gym is affiliated with I.K.O So-Kyokushin, and our instructors are certified and verified.</p></details>
    </div>
  </div>
</section>

<section class="testi on-dark">
  {ph("testimonial-bg.jpg","ph--dark","")}
  <div class="wrap"><div class="testi__in rv">
    <p class="eyebrow">Testimonial</p>
    <!-- TODO: replace with a real student or parent quote -->
    <blockquote>“My son was shy and unfocused. After six months with Shihan Raja he walks taller, listens better and has earned his first two belts.”</blockquote>
    <cite>Parent of a junior student</cite>
  </div></div>
</section>

<section class="sec page-dark on-dark">
  <div class="wrap split">
    <div class="rv">
      <p class="eyebrow">Why train with us</p>
      <h2 class="h-lg" style="margin:14px 0 16px">The best <span class="red">Kyokushin dojo</span> to start your journey</h2>
      <p class="lede">Traditional Japanese terminology, a clear syllabus, regular belt tests and instructors who care about every student's progress.</p>
      <div style="margin-top:24px"><a class="btn btn--red" href="instructors.html">Meet the instructors {ARROW}</a></div>
    </div>
    <div class="mosaic rv">
      {ph("gallery-1.jpg","ph--dark m1","Students training")}{ph("gallery-2.jpg","ph--dark","Kata practice")}{ph("gallery-3.jpg","ph--dark","Belt ceremony")}
      {ph("gallery-4.jpg","ph--dark","Kids class")}{ph("gallery-5.jpg","ph--dark","Sparring")}{ph("gallery-6.jpg","ph--dark","Team photo")}
    </div>
  </div>
</section>

<section class="visit on-dark" id="contact">
  <div class="visit__copy">
    <p class="eyebrow">Visit the dojo</p>
    <h2 class="h-lg">Book your <span class="red">free trial</span></h2>
    <ul class="contact-list">
      <li>{svg("pin")}<span data-bind="address">Address coming soon</span></li>
      <li>{svg("phone")}<a data-wa="" href="#" data-bind="phone">WhatsApp us</a></li>
      <li>{svg("mail")}<a data-bind="email" href="#">—</a></li>
    </ul>
    <div style="display:flex; flex-wrap:wrap; gap:12px"><a class="btn btn--red" data-wa="Assalam o Alaikum! I'd like to book a free trial class." href="#">Message on WhatsApp {ARROW}</a><a class="btn btn--line" data-directions href="https://www.google.com/maps/search/?api=1&amp;query=Raja+Martial+Arts+Civic+Center+Bahria+Town+Islamabad" target="_blank" rel="noopener">Get directions</a></div>
  </div>
  <div class="map" data-map>{ph("map.jpg","","Map placeholder — set the location in config.js")}</div>
</section>
'''

# =====================================================================  BIOGRAPHY
bio = f'''
<div class="page-dark on-dark">
<section class="hero hero--dark bio-hero">
  <div class="wrap hero__grid">
    <div class="hero__copy">
      <p class="eyebrow">The founder of Raja's Martial Arts</p>
      <h1>Shihan<span class="red">Raja Khalid Mehmood Janjua</span></h1>
      <div class="bio-tags"><span>Kyokushin</span><span>Founder</span><span>Mentor</span><span>Coach</span></div>
    </div>
    <div class="hero__art">
      {ph("shihan-home.jpg","ph--round","Shihan Raja Khalid Mehmood Janjua")}
      <div class="kanji" aria-hidden="true">極真会</div>
    </div>
  </div>
</section>

<div class="wrap stack">
  <section class="panel-white two rv">
    <div>
      <p class="eyebrow">His story</p>
      <h2 class="h-lg" style="margin:12px 0 16px">A life built on <span class="red">discipline</span></h2>
      <!-- TODO: replace with Shihan Raja's real story -->
      <p>Shihan Raja Khalid Mehmood Janjua began training in Kyokushin Karate as a young man, drawn to its demanding, full-contact tradition. Decades of training, competing and teaching shaped a simple belief: that the dojo builds character as much as it builds fighters.</p>
      <p style="margin-top:12px">He founded Raja's Martial Arts to bring authentic Kyokushin — its etiquette, its Japanese terminology and its uncompromising standards — to students of every age.</p>
      <div style="margin-top:22px"><a class="btn btn--line" href="#journey">His journey {ARROW}</a></div>
    </div>
    {ph("shihan-home.jpg","gray","Black and white portrait of Shihan Raja", extra=' style="aspect-ratio:4/3"')}
  </section>

  <section class="rv" id="journey">
    <div class="two" style="align-items:end">
      <div><p class="eyebrow">Milestones</p><h2 class="h-lg" style="margin-top:12px">A journey across <span class="red">decades</span></h2></div>
      <p class="lede">From white belt to Shihan — the moments that shaped the dojo.</p>
    </div>
    <!-- TODO: real years and milestones -->
    <div class="timeline">
      <div class="tl">{ph("bio-1.jpg","ph--dark gray","Early training")}<b>Year</b><h4>First steps</h4><p>Begins Kyokushin training.</p></div>
      <div class="tl">{ph("bio-2.jpg","ph--dark gray","Black belt")}<b>Year</b><h4>Black belt</h4><p>Earns Shodan after years of grading.</p></div>
      <div class="tl">{ph("bio-3.jpg","ph--dark gray","Tournaments")}<b>Year</b><h4>Tournaments</h4><p>Competes and coaches at national events.</p></div>
      <div class="tl">{ph("bio-4.jpg","ph--dark gray","Opening the dojo")}<b>Year</b><h4>Dojo founded</h4><p>Opens Raja's Martial Arts.</p></div>
      <div class="tl">{ph("bio-5.jpg","ph--dark gray","Shihan title")}<b>Year</b><h4>Shihan</h4><p>Recognised with the title of Shihan.</p></div>
      <div class="tl">{ph("bio-6.jpg","ph--dark gray","Students today")}<b>Today</b><h4>The legacy</h4><p>Hundreds of students trained.</p></div>
    </div>
  </section>

  <section class="panel-white two rv">
    <div>
      <p class="eyebrow">Philosophy</p>
      <h2 class="h-lg" style="margin:12px 0 16px">The ideas he <span class="red">lives by</span></h2>
      <p>“Osu” means to persevere under pressure. It is the word every student learns first, and the idea behind everything taught in this dojo.</p>
    </div>
    <div class="values">
      <div class="value">{ic("hands")}<b>Respect</b><span>Bow in, bow out, honour every partner.</span></div>
      <div class="value">{ic("flame")}<b>Perseverance</b><span>Osu — keep going when it's hard.</span></div>
      <div class="value">{ic("target")}<b>Focus</b><span>One technique, done properly.</span></div>
      <div class="value">{ic("shield")}<b>Humility</b><span>Strength used only to protect.</span></div>
    </div>
  </section>

  <section class="rv">
    <div class="two" style="align-items:end">
      <div><p class="eyebrow">Photos &amp; videos</p><h2 class="h-lg" style="margin-top:12px">Moments that <span class="red">matter</span></h2></div>
      <p class="lede">Gradings, tournaments, seminars and everyday training.</p>
    </div>
    <div class="media">
      <div class="ph ph--dark m-big" data-file="bio-video.jpg" data-video-box><img src="assets/img/bio-video.jpg" alt="Shihan Raja training" loading="lazy"><button class="play" type="button" data-video="assets/video/shihan.mp4" aria-label="Play video">{PLAY}</button></div>
      {ph("bio-g1.jpg","ph--dark","Seminar")}{ph("bio-g2.jpg","ph--dark","Grading")}{ph("bio-g3.jpg","ph--dark","Tournament")}{ph("bio-g4.jpg","ph--dark","Students")}
    </div>
  </section>

  <section class="panel-white mentor rv">
    <div>
      <p class="eyebrow">Beyond the dojo</p>
      <h2 class="h-lg" style="margin:12px 0 16px">More than a martial artist — <span class="red">a mentor &amp; guide</span></h2>
      <p>Shihan Raja's students become black belts, but also better sons and daughters, professionals and leaders.</p>
    </div>
    <div class="grid g4">
      <div class="value">{ic("users")}<b>Community</b><span>A dojo family</span></div>
      <div class="value">{ic("heart")}<b>Health</b><span>Fitness for life</span></div>
      <div class="value">{ic("brain")}<b>Mindset</b><span>Calm under pressure</span></div>
      <div class="value">{ic("star")}<b>Leadership</b><span>Seniors teach juniors</span></div>
    </div>
  </section>
</div>

<p class="quote-bar">The dojo is not a place to build fighters. It is a place to build people.</p>

<section class="final">
  {ph("bio-final.jpg","ph--dark","Shihan Raja from behind, black belt")}
  <div class="wrap" style="width:100%"><div class="final__copy rv">
    <p class="eyebrow">Train with Shihan Raja</p>
    <h2 class="h-lg">Your journey starts <span class="red">with one bow</span></h2>
    <p class="lede">Book a free trial class and experience authentic Kyokushin.</p>
    <div><a class="btn btn--red" href="index.html#trial">Book Free Trial {ARROW}</a></div>
  </div></div>
</section>
</div>
'''

# =====================================================================  INSTRUCTORS
# ---- Instructor data: ONE place to edit names, ranks, clubs, bios and achievements. ----
# Each entry gets a card on instructors.html, a tile in the coaches carousel and its own profile page.
# Anything still marked "to be added" / "TBC" is a placeholder waiting for the real details.
TBA = "To be added"
INSTRUCTORS = [
 dict(slug="shihan-raja", img="shihan-home.jpg", coach_img="shihan-home.jpg", big=True,
      role="Head Instructor · Founder", name="Shihan Raja Khalid Mehmood Janjua", short="Shihan Raja", tag="Head Instructor",
      club="Raja's Martial Arts &amp; Fitness Gym", loc="Civic Center, Bahria Town, Islamabad", rank="Shihan — dan rank TBC", exp="TBC",
      card="Founder of Raja's Martial Arts with decades of Kyokushin experience as a fighter, coach and examiner.",
      pts=["Dan rank — TBC","Belt examiner","Tournament coach"], quote="Osu — never give up.",
      about=["Shihan Raja Khalid Mehmood Janjua is the founder and head instructor of Raja's Martial Arts &amp; Fitness Gym, an I.K.O So-Kyokushin dojo in Bahria Town, Islamabad.",
             "He teaches authentic full-contact Kyokushin Karate — its etiquette, its Japanese terminology and its standards — and personally conducts every belt test in the dojo."],
      achievements=["To be added — titles, tournaments and certifications", "To be added", "To be added"],
      specialities=["Kyokushin Karate","Kumite","Belt examinations","Self defense","Personal training"],
      classes=["Mixed class · 6:00 – 8:00 pm","Belt tests &amp; gradings","Personal training · by appointment"],
      more="biography.html"),
 # IMG_7379 — name read from his trophy plate
 dict(slug="aneeb-butt", img="instructor-aneeb-butt.jpg", coach_img="instructor-aneeb-butt.jpg", big=False,
      role="Instructor", name="Sensei Aneeb Butt", short="Sensei Aneeb", tag="Instructor",
      club="Raja's Martial Arts &amp; Fitness Gym", loc="Civic Center, Bahria Town, Islamabad", rank="Rank TBC", exp="TBC",
      card="Sensei Aneeb Butt is a Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym.", pts=['Kyokushin Karate', 'Championship recognition'], quote="",
      about=["Sensei Aneeb Butt is a Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym."],
      achievements=['Trophy presented at the All Punjab Open So Kyokushin Karate Championship, Chakwal — 22 November 2026', 'To be added', 'To be added'], specialities=["Kyokushin Karate","Kumite","Kata"],
      classes=["Class timings: see the schedule on the home page"]),
 # IMG_7381 — name read from his trophy plate
 dict(slug="toheed-shah", img="instructor-toheed-shah.jpg", coach_img="instructor-toheed-shah.jpg", big=False,
      role="Instructor", name="Sensei Toheed Shah", short="Sensei Toheed", tag="Instructor",
      club="Raja's Martial Arts &amp; Fitness Gym", loc="Civic Center, Bahria Town, Islamabad", rank="Rank TBC", exp="TBC",
      card="Sensei Toheed Shah is a Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym.", pts=['Kyokushin Karate', 'Championship recognition'], quote="",
      about=["Sensei Toheed Shah is a Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym."],
      achievements=['Trophy presented at the All Punjab Open So Kyokushin Karate Championship, Chakwal — 22 November 2026', 'To be added', 'To be added'], specialities=["Kyokushin Karate","Kumite","Kata"],
      classes=["Class timings: see the schedule on the home page"]),
 # IMG_7351 / IMG_7353 — name read from his trophy plate
 dict(slug="kamran-yaseen", img="instructor-kamran-yaseen.jpg", coach_img="instructor-kamran-yaseen.jpg", big=False,
      role="Instructor", name="Sensei M. Kamran Yaseen", short="Sensei Kamran", tag="Instructor",
      club="Raja's Martial Arts &amp; Fitness Gym", loc="Civic Center, Bahria Town, Islamabad", rank="Rank TBC", exp="TBC",
      card="Sensei M. Kamran Yaseen is a Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym.", pts=["Kyokushin Karate","Championship recognition"], quote="",
      about=["Sensei M. Kamran Yaseen is a Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym."],
      achievements=["Trophy presented at the All Punjab Open So Kyokushin Karate Championship, Chakwal — 22 November 2026", "To be added", "To be added"],
      specialities=["Kyokushin Karate","Kumite","Kata"],
      classes=["Class timings: see the schedule on the home page"]),
 # IMG_7375
 dict(slug="sensei-03", img="instructor-sensei-03.jpg", coach_img="instructor-sensei-03.jpg", big=False,
      role="Instructor", name="Sensei — name TBC", short="Sensei TBC", tag="Instructor",
      club="Raja's Martial Arts &amp; Fitness Gym", loc="Civic Center, Bahria Town, Islamabad", rank="Rank TBC", exp="TBC",
      card="Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added.", pts=['Kyokushin Karate'], quote="",
      about=["Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added."],
      achievements=['To be added', 'To be added', 'To be added'], specialities=["Kyokushin Karate","Kumite","Kata"],
      classes=["Class timings: see the schedule on the home page"]),
 # IMG_7367
 dict(slug="sensei-04", img="instructor-sensei-04.jpg", coach_img="instructor-sensei-04.jpg", big=False,
      role="Instructor", name="Sensei — name TBC", short="Sensei TBC", tag="Instructor",
      club="Raja's Martial Arts &amp; Fitness Gym", loc="Civic Center, Bahria Town, Islamabad", rank="Rank TBC", exp="TBC",
      card="Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added.", pts=['Kyokushin Karate'], quote="",
      about=["Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added."],
      achievements=['To be added', 'To be added', 'To be added'], specialities=["Kyokushin Karate","Kumite","Kata"],
      classes=["Class timings: see the schedule on the home page"]),
 # IMG_7361
 dict(slug="sensei-05", img="instructor-sensei-05.jpg", coach_img="instructor-sensei-05.jpg", big=False,
      role="Instructor", name="Sensei — name TBC", short="Sensei TBC", tag="Instructor",
      club="Raja's Martial Arts &amp; Fitness Gym", loc="Civic Center, Bahria Town, Islamabad", rank="Rank TBC", exp="TBC",
      card="Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added.", pts=['Kyokushin Karate'], quote="",
      about=["Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added."],
      achievements=['To be added', 'To be added', 'To be added'], specialities=["Kyokushin Karate","Kumite","Kata"],
      classes=["Class timings: see the schedule on the home page"]),
 # IMG_7359
 dict(slug="sensei-06", img="instructor-sensei-06.jpg", coach_img="instructor-sensei-06.jpg", big=False,
      role="Instructor", name="Sensei — name TBC", short="Sensei TBC", tag="Instructor",
      club="Raja's Martial Arts &amp; Fitness Gym", loc="Civic Center, Bahria Town, Islamabad", rank="Rank TBC", exp="TBC",
      card="Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added.", pts=['Kyokushin Karate'], quote="",
      about=["Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added."],
      achievements=['To be added', 'To be added', 'To be added'], specialities=["Kyokushin Karate","Kumite","Kata"],
      classes=["Class timings: see the schedule on the home page"]),
 # IMG_7356
 dict(slug="sensei-07", img="instructor-sensei-07.jpg", coach_img="instructor-sensei-07.jpg", big=False,
      role="Instructor", name="Sensei — name TBC", short="Sensei TBC", tag="Instructor",
      club="Raja's Martial Arts &amp; Fitness Gym", loc="Civic Center, Bahria Town, Islamabad", rank="Rank TBC", exp="TBC",
      card="Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added.", pts=['Kyokushin Karate'], quote="",
      about=["Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added."],
      achievements=['To be added', 'To be added', 'To be added'], specialities=["Kyokushin Karate","Kumite","Kata"],
      classes=["Class timings: see the schedule on the home page"]),
 # IMG_7350
 dict(slug="sensei-08", img="instructor-sensei-08.jpg", coach_img="instructor-sensei-08.jpg", big=False,
      role="Instructor", name="Sensei — name TBC", short="Sensei TBC", tag="Instructor",
      club="Raja's Martial Arts &amp; Fitness Gym", loc="Civic Center, Bahria Town, Islamabad", rank="Rank TBC", exp="TBC",
      card="Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added.", pts=['Kyokushin Karate'], quote="",
      about=["Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added."],
      achievements=['To be added', 'To be added', 'To be added'], specialities=["Kyokushin Karate","Kumite","Kata"],
      classes=["Class timings: see the schedule on the home page"]),
 # IMG_7347
 dict(slug="sensei-09", img="instructor-sensei-09.jpg", coach_img="instructor-sensei-09.jpg", big=False,
      role="Instructor", name="Sensei — name TBC", short="Sensei TBC", tag="Instructor",
      club="Raja's Martial Arts &amp; Fitness Gym", loc="Civic Center, Bahria Town, Islamabad", rank="Rank TBC", exp="TBC",
      card="Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added.", pts=['Kyokushin Karate'], quote="",
      about=["Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added."],
      achievements=['To be added', 'To be added', 'To be added'], specialities=["Kyokushin Karate","Kumite","Kata"],
      classes=["Class timings: see the schedule on the home page"]),
 # IMG_7344
 dict(slug="sensei-10", img="instructor-sensei-10.jpg", coach_img="instructor-sensei-10.jpg", big=False,
      role="Instructor", name="Sensei — name TBC", short="Sensei TBC", tag="Instructor",
      club="Raja's Martial Arts &amp; Fitness Gym", loc="Civic Center, Bahria Town, Islamabad", rank="Rank TBC", exp="TBC",
      card="Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added.", pts=['Kyokushin Karate'], quote="",
      about=["Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added."],
      achievements=['To be added', 'To be added', 'To be added'], specialities=["Kyokushin Karate","Kumite","Kata"],
      classes=["Class timings: see the schedule on the home page"]),
 # IMG_7291
 dict(slug="sensei-11", img="instructor-sensei-11.jpg", coach_img="instructor-sensei-11.jpg", big=False,
      role="Instructor", name="Sensei — name TBC", short="Sensei TBC", tag="Instructor",
      club="Raja's Martial Arts &amp; Fitness Gym", loc="Civic Center, Bahria Town, Islamabad", rank="Rank TBC", exp="TBC",
      card="Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added.", pts=['Kyokushin Karate'], quote="",
      about=["Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added."],
      achievements=['To be added', 'To be added', 'To be added'], specialities=["Kyokushin Karate","Kumite","Kata"],
      classes=["Class timings: see the schedule on the home page"]),
 # IMG_7294
 dict(slug="sensei-12", img="instructor-sensei-12.jpg", coach_img="instructor-sensei-12.jpg", big=False,
      role="Instructor", name="Sensei — name TBC", short="Sensei TBC", tag="Instructor",
      club="Raja's Martial Arts &amp; Fitness Gym", loc="Civic Center, Bahria Town, Islamabad", rank="Rank TBC", exp="TBC",
      card="Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added.", pts=['Kyokushin Karate'], quote="",
      about=["Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added."],
      achievements=['To be added', 'To be added', 'To be added'], specialities=["Kyokushin Karate","Kumite","Kata"],
      classes=["Class timings: see the schedule on the home page"]),
 # IMG_7282 (grey suit)
 dict(slug="sensei-13", img="instructor-sensei-13.jpg", coach_img="instructor-sensei-13.jpg", big=False,
      role="Instructor", name="Sensei — name TBC", short="Sensei TBC", tag="Instructor",
      club="Raja's Martial Arts &amp; Fitness Gym", loc="Civic Center, Bahria Town, Islamabad", rank="Rank TBC", exp="TBC",
      card="Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added.", pts=['Kyokushin Karate'], quote="",
      about=["Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added."],
      achievements=['To be added', 'To be added', 'To be added'], specialities=["Kyokushin Karate","Kumite","Kata"],
      classes=["Class timings: see the schedule on the home page"]),
 # IMG_7274 / IMG_7273 (grey hoodie) — best shot used
 dict(slug="sensei-14", img="instructor-sensei-14.jpg", coach_img="instructor-sensei-14.jpg", big=False,
      role="Instructor", name="Sensei — name TBC", short="Sensei TBC", tag="Instructor",
      club="Raja's Martial Arts &amp; Fitness Gym", loc="Civic Center, Bahria Town, Islamabad", rank="Rank TBC", exp="TBC",
      card="Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added.", pts=['Kyokushin Karate'], quote="",
      about=["Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added."],
      achievements=['To be added', 'To be added', 'To be added'], specialities=["Kyokushin Karate","Kumite","Kata"],
      classes=["Class timings: see the schedule on the home page"]),
 # IMG_7270 / IMG_7269 (blue shirt) — best shot used
 dict(slug="sensei-15", img="instructor-sensei-15.jpg", coach_img="instructor-sensei-15.jpg", big=False,
      role="Instructor", name="Sensei — name TBC", short="Sensei TBC", tag="Instructor",
      club="Raja's Martial Arts &amp; Fitness Gym", loc="Civic Center, Bahria Town, Islamabad", rank="Rank TBC", exp="TBC",
      card="Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added.", pts=['Kyokushin Karate'], quote="",
      about=["Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added."],
      achievements=['To be added', 'To be added', 'To be added'], specialities=["Kyokushin Karate","Kumite","Kata"],
      classes=["Class timings: see the schedule on the home page"]),
 # IMG_7266 / IMG_7267 (purple shirt) — best shot used
 dict(slug="sensei-16", img="instructor-sensei-16.jpg", coach_img="instructor-sensei-16.jpg", big=False,
      role="Instructor", name="Sensei — name TBC", short="Sensei TBC", tag="Instructor",
      club="Raja's Martial Arts &amp; Fitness Gym", loc="Civic Center, Bahria Town, Islamabad", rank="Rank TBC", exp="TBC",
      card="Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added.", pts=['Kyokushin Karate'], quote="",
      about=["Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added."],
      achievements=['To be added', 'To be added', 'To be added'], specialities=["Kyokushin Karate","Kumite","Kata"],
      classes=["Class timings: see the schedule on the home page"]),
 # IMG_7264 / IMG_7253 / IMG_7251 (white beard) — best shot used
 dict(slug="sensei-17", img="instructor-sensei-17.jpg", coach_img="instructor-sensei-17.jpg", big=False,
      role="Instructor", name="Sensei — name TBC", short="Sensei TBC", tag="Instructor",
      club="Raja's Martial Arts &amp; Fitness Gym", loc="Civic Center, Bahria Town, Islamabad", rank="Rank TBC", exp="TBC",
      card="Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added.", pts=['Kyokushin Karate'], quote="",
      about=["Kyokushin instructor at Raja's Martial Arts &amp; Fitness Gym. Full biography to be added."],
      achievements=['To be added', 'To be added', 'To be added'], specialities=["Kyokushin Karate","Kumite","Kata"],
      classes=["Class timings: see the schedule on the home page"]),
]
def prof_url(c): return f"instructor-{c['slug']}.html"

def coach_card(c):
    size, pad = ("coach-lg", 20) if c["big"] else ("coach-sm", 16)
    return f'''<a class="card coach {size} rv" style="padding:{pad}px" href="{prof_url(c)}" aria-label="{c['name']} — view profile">{ph(c['img'],"",c['name'])}
<div><span class="coach__role">{c['role']}</span><h3 class="coach__name">{c['name']}</h3><p class="coach__loc">{svg("pin")}{c['loc']}</p><p class="coach__bio">{c['card']}</p>
<ul class="ticks">{"".join(f"<li>{p}</li>" for p in c['pts'])}</ul>{"<p class=\"quote-hand\">“" + c["quote"] + "”</p>" if c["quote"] else ""}<span class="link coach__more">View profile</span></div></a>'''
def coach_tile(c):
    return f'''<a class="coach-card" href="{prof_url(c)}" aria-label="{c['short']}, {c['tag']} — view profile">{ph(c['coach_img'],"ph--dark",c['short'])}<p class="coach-card__name">{c['short']}<small>{c['tag']}</small></p></a>'''

def profile(c):
    others = "".join(f'''<a class="card other" href="{prof_url(o)}">{ph(o['img'],"",o['name'])}<div><span class="coach__role">{o['role']}</span><b>{o['short']}</b></div></a>''' for o in (INSTRUCTORS[INSTRUCTORS.index(c)+1:] + INSTRUCTORS[:INSTRUCTORS.index(c)])[:4])
    ach = "".join(f'<li class="{"is-tba" if a.startswith(TBA) else ""}">{a}</li>' for a in c['achievements'])
    more = f'<a class="btn btn--line" href="{c["more"]}">Read his full story {ARROW}</a>' if c.get("more") else ""
    wa_msg = f"Assalam o Alaikum! I'd like to train with {html.unescape(c['short'])}."
    return f'''
<section class="prof-hero">
  <div class="wash" aria-hidden="true"></div>
  <div class="wrap">
    <p class="crumbs"><a href="instructors.html">Instructors</a> <span>/</span> {c['short']}</p>
    <div class="prof-hero__grid">
      {ph(c['img'],"prof-photo",c['name'])}
      <div class="prof-hero__copy">
        <p class="eyebrow">{c['role']}</p>
        <h1>{c['name']}</h1>
        <p class="coach__loc">{svg("pin")}{c['club']} · {c['loc']}</p>
        {"<p class=\"quote-hand\">“" + c["quote"] + "”</p>" if c["quote"] else ""}
        <dl class="prof-facts">
          <div><dt>Rank</dt><dd>{c['rank']}</dd></div>
          <div><dt>Experience</dt><dd>{c['exp']}</dd></div>
          <div><dt>Club</dt><dd>{c['club']}</dd></div>
        </dl>
        <div class="prof-ctas"><a class="btn btn--red" data-wa="{html.escape(wa_msg)}" href="#">Train with {c['short']} {ARROW}</a>{more}</div>
      </div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap prof-body">
    <div class="prof-main">
      <div class="rv"><p class="eyebrow">Biography</p><h2 class="h-md" style="margin:12px 0 14px">About {c['short']}</h2>{"".join(f"<p>{p}</p>" for p in c['about'])}</div>
      <div class="rv"><p class="eyebrow">Achievements</p><h2 class="h-md" style="margin:12px 0 14px">Titles &amp; milestones</h2>
        <!-- TODO: replace "To be added" with real achievements -->
        <ul class="ticks prof-ach">{ach}</ul></div>
      <div class="rv"><p class="eyebrow">Specialities</p><h2 class="h-md" style="margin:12px 0 14px">What {c['short']} teaches</h2>
        <ul class="chips">{"".join(f"<li>{s}</li>" for s in c['specialities'])}</ul></div>
    </div>
    <aside class="prof-side">
      <div class="card prof-box rv"><h3>Club</h3>
        <ul class="contact-list"><li>{svg("temple")}<span><b>{c['club']}</b><br>I.K.O So-Kyokushin</span></li><li>{svg("pin")}<span>{c['loc']}</span></li></ul></div>
      <div class="card prof-box rv"><h3>Classes</h3>
        <ul class="contact-list">{"".join(f"<li>{svg('clock')}<span>{k}</span></li>" for k in c['classes'])}</ul>
        <a class="btn btn--red btn--full" href="index.html#trial" style="margin-top:16px">Book free trial</a></div>
    </aside>
  </div>
</section>

<section class="sec sec--alt">
  <div class="wrap">
    <div class="sec-head"><p class="eyebrow">The team</p><h2 class="h-lg">Other <span class="red">instructors</span></h2></div>
    <div class="others">{others}</div>
    <div style="margin-top:28px"><a class="btn btn--line" href="instructors.html">All instructors</a></div>
  </div>
</section>
'''
instr = f'''
<section class="hero hero--light instr-hero">
  <div class="wash" aria-hidden="true"></div>
  <div class="wrap hero__grid">
    <div class="hero__copy">
      <p class="eyebrow">Our instructors</p>
      <h1>Experience.<br>Discipline.<br>Guidance.</h1>
      <p class="lede">Every instructor at Raja's Martial Arts is a certified, verified Kyokushin black belt trained under Shihan Raja.</p>
      <!-- TODO: real numbers -->
      <div class="stats">
        <div class="stat">{ic("medal")}<b>25+</b><span>Years of<br>experience</span></div>
        <div class="stat">{ic("users")}<b>500+</b><span>Students<br>trained</span></div>
        <div class="stat">{ic("pin")}<b>3</b><span>Dojo<br>locations</span></div>
      </div>
    </div>
    <div class="hero__art">
      {ph("instructor-hero.png","ph--cut","Instructor from behind, 極真会 on his gi")}
      <div class="kanji" aria-hidden="true">極真会</div>
      <p class="quote-hand">Great teachers don't give answers, they build stronger people.</p>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head"><p class="eyebrow">Meet the team</p><h2 class="h-lg">Our <span class="red">instructors</span></h2></div>
    <!-- TODO: replace names, ranks, locations and bios with the real instructors -->
    <div class="grid g1">{"".join(coach_card(c) for c in INSTRUCTORS if c["big"])}</div>
    <div class="grid g3" style="margin-top:24px">{"".join(coach_card(c) for c in INSTRUCTORS if not c["big"])}</div>
  </div>
</section>

<section class="prime on-dark">
  <div class="wrap">
    <h2>Raja's Coaches</h2>
    <p class="lede">The people behind Raja's Martial Arts — bringing experience, energy and purpose to every class.</p>
    <div class="carousel">
      <button class="carousel__btn carousel__btn--prev" type="button" aria-label="Previous coaches">{svg("left")}</button>
      <div class="carousel__track">
        {"".join(coach_tile(c) for c in INSTRUCTORS)}
      </div>
      <button class="carousel__btn carousel__btn--next" type="button" aria-label="Next coaches">{svg("right")}</button>
    </div>
    <div class="prime__ctas"><a class="btn" href="biography.html">Meet the Shihan</a><a class="btn" href="courses.html">Personal Training</a></div>
  </div>
</section>

<section class="locations sec">
  <div class="wash" aria-hidden="true"></div>
  <div class="wrap locations__in">
    <div class="rv">
      <p class="eyebrow">Our dojos</p>
      <h2 class="h-lg" style="margin:12px 0 14px">Different locations,<br><span class="red">one mission</span></h2>
      <p class="lede">The same syllabus, the same standards and the same Kyokushin spirit at every branch.</p>
    </div>
    <!-- TODO: real branch names and addresses -->
    <ul class="loc-list rv">
      <li><span><b>Main Dojo</b><span data-bind="address">Address coming soon</span></span></li>
      <li><span><b>Branch 2</b>Address TBC</span></li>
      <li><span><b>Branch 3</b>Address TBC</span></li>
      <li><span><b>Online</b>Learning portal — coming soon</span></li>
    </ul>
    <p class="quote-hand rv">One dojo,<br>many families.</p>
  </div>
</section>
'''

# =====================================================================  COURSES
def course(img, icon, title, tag, desc):
    return f'''<article class="card course rv">{ph(img,"",title)}<div class="course__body">{ic(icon,"ico ico--ring")}<h3>{title}</h3><span class="course__tag">{tag}</span><p>{desc}</p><a class="link" href="syllabus.html">Learn more</a></div></article>'''
courses = f'''
<section class="hero hero--dark on-dark courses-hero">
  <div class="wrap hero__grid">
    <div class="hero__copy">
      <p class="eyebrow">Our courses</p>
      <h1>Build a stronger,<br><span class="red">healthier you</span></h1>
      <p class="lede">Four focused courses, one Kyokushin foundation. Choose the path that fits your goals — every course is coached personally and tracked against our syllabus.</p>
      <div style="display:flex; gap:12px; flex-wrap:wrap"><a class="btn btn--red" href="#fees">View fees {ARROW}</a><a class="btn btn--line" href="index.html#trial">Free trial</a></div>
    </div>
    <div class="hero__art">
      {ph("shihan-home.jpg","ph--round","Shihan Raja, arms crossed")}
      <div class="kanji" aria-hidden="true">極真会</div>
      <p class="quote-hand">Your only limit is the one you accept.</p>
    </div>
  </div>
</section>

<section class="sec sec--alt">
  <div class="wrap">
    <div class="sec-head"><p class="eyebrow">Our courses</p><h2 class="h-lg">Choose <span class="red">your path</span></h2></div>
    <div class="grid g4">
      {course("course-karate.jpg","fist","Kyokushin Karate","Traditional · All ages","Full Kyokushin syllabus: kihon, kata and kumite, with regular belt gradings from white to black.")}
      {course("course-selfdefense.jpg","shield","Self Defense","Practical · Teens &amp; adults","Real-world techniques, awareness and escapes. Ideal for women and anyone who wants to feel safe.")}
      {course("course-weightloss.jpg","flame","Weight Loss","Fitness · Adults","Karate conditioning, circuits and strength work that burn fat and build stamina.")}
      {course("course-mental.jpg","brain","Mental Health","Mind · All ages","Breathing, meditation (mokuso) and discipline to reduce stress and build focus and resilience.")}
    </div>
  </div>
</section>

<section class="mtc on-dark sec--tight">
  <div class="wrap mtc__in">
    <div><p class="eyebrow">Why we're different</p><h2 class="h-lg" style="margin-top:12px">More than<br><span class="red">just classes</span></h2></div>
    <div class="mtc__items">
      <div class="mtc__item">{ic("medal")}<b>Certified instructors</b><span>Verified black belts</span></div>
      <div class="mtc__item">{ic("book")}<b>Clear syllabus</b><span>Know what's next</span></div>
      <div class="mtc__item">{ic("chart")}<b>Track progress</b><span>Belt tests &amp; feedback</span></div>
      <div class="mtc__item">{ic("users")}<b>Dojo family</b><span>Train together</span></div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap steps-sec">
    <div class="rv">
      <p class="eyebrow">How it works</p>
      <h2 class="h-lg" style="margin:12px 0 14px">Simple steps.<br><span class="red">Real progress.</span></h2>
      <p class="lede">From your first free class to your next belt, here's exactly how it works.</p>
      <div style="margin-top:20px"><a class="btn btn--red" href="index.html#trial">Book free trial {ARROW}</a></div>
    </div>
    <div class="video rv" data-video-box>{ph("courses-video.jpg","ph--dark","Student looking over mountains")}<button class="play" type="button" data-video="assets/video/courses.mp4" aria-label="Play video">{PLAY}</button></div>
    <ol class="steps rv">
      <li>{ic("cal")}<div><b>1. Book a free trial</b><span>Pick a time on WhatsApp or the form.</span></div></li>
      <li>{ic("user")}<div><b>2. Meet your instructor</b><span>We assess your level and goals.</span></div></li>
      <li>{ic("check")}<div><b>3. Choose a plan</b><span>Monthly, family or personal training.</span></div></li>
      <li>{ic("medal")}<div><b>4. Train &amp; grade</b><span>Follow the syllabus to your next belt.</span></div></li>
    </ol>
  </div>
</section>

<section class="sec sec--alt" id="fees">
  <div class="wrap">
    <div class="sec-head sec-head--c">
      <p class="eyebrow eyebrow--c">Fee schedule</p>
      <h2 class="h-lg">Membership <span class="red">fees</span></h2>
      <p class="lede">Simple, honest pricing. One admission fee, then a flat monthly fee — with a discount when the family trains together.</p>
    </div>
    <div class="fees">
      <article class="card fee fee--hot rv"><p class="fee__days">Monthly <small>/ per student</small></p><p class="fee__price">PKR 8,000 <small>/ month</small></p>
        <ul class="ticks"><li>Kyokushin Karate classes</li><li>Fitness &amp; conditioning</li><li>Belt test eligibility</li><li>Sparring sessions</li></ul>
        <a class="btn btn--red btn--full" data-wa="Assalam o Alaikum! I'd like to join — monthly membership (PKR 8,000)." href="#">Join now</a></article>
      <article class="card fee rv"><p class="fee__days">Family <small>/ per member</small></p><p class="fee__price">PKR 7,000 <small>/ month</small></p>
        <ul class="ticks"><li>For 2 or more family members</li><li>Same classes as monthly</li><li>Kids, parents &amp; siblings</li><li>Save PKR 1,000 per person</li></ul>
        <a class="btn btn--line btn--full" data-wa="Assalam o Alaikum! We'd like to join as a family (PKR 7,000 per member)." href="#">Join as a family</a></article>
      <article class="card fee rv"><p class="fee__days">Personal <small>/ 1-on-1 training</small></p><p class="fee__price">PKR 25,000 <small>/ month</small></p>
        <ul class="ticks"><li>Kyokushin &amp; kickboxing</li><li>Self defense</li><li>Weight loss &amp; fitness</li><li>Mental health &amp; focus</li></ul>
        <a class="btn btn--line btn--full" data-wa="Assalam o Alaikum! I'm interested in personal training (PKR 25,000)." href="#">Book personal training</a></article>
    </div>
    <div class="fee-extras rv">
      <div class="fee-extra">{ic("cal")}<div><b>Admission fee</b><span>One-time, on joining</span></div><strong>PKR 5,000</strong></div>
      <div class="fee-extra">{ic("user")}<div><b>Gi (dojo uniform)</b><span>Charged separately</span></div><strong>PKR 5,000</strong></div>
    </div>
  </div>
</section>

<section class="choose">
  <div class="wrap choose__in"><h2 class="h-md">Choose your course</h2><a class="btn btn--red" href="index.html#trial">Get started {ARROW}</a></div>
</section>
'''

# =====================================================================  SYLLABUS
def syl(img, title, tag, sub, mods):
    rows = "".join(f'<li><i>{k+1}</i><div><b>{a}</b><span>{b}</span></div><em>{c}</em></li>' for k,(a,b,c) in enumerate(mods))
    return f'''<div class="syl-row rv"><div class="syl-art">{ph(img,"",title)}<div class="syl-art__txt"><span class="tag">{tag}</span><h2>{title}</h2><p>{sub}</p><div><a class="btn btn--line btn--sm" href="index.html#trial">Start this course</a></div></div></div>
<div><p class="mods__h">Modules</p><ul class="mods">{rows}</ul></div></div>'''
syllabus = f'''
<section class="hero hero--light">
  <div class="wash" aria-hidden="true"></div>
  <div class="wrap hero__grid">
    <div class="hero__copy">
      <p class="eyebrow">Course syllabus</p>
      <h1 class="h-xl up">Your journey.<br><span class="red">Our syllabus.</span></h1>
      <p class="lede">A clear, structured syllabus for every course — so you always know what you are learning now and what comes next.</p>
      <div class="stats">
        <div class="stat">{ic("book")}<b>4</b><span>Courses</span></div>
        <div class="stat">{ic("chart")}<b>Step</b><span>by step<br>progress</span></div>
        <div class="stat">{ic("user")}<b>Expert</b><span>instructors</span></div>
        <div class="stat">{ic("medal")}<b>Real</b><span>results</span></div>
      </div>
    </div>
    <div class="hero__art">
      {ph("syllabus-hero.png","ph--cut","Student from behind, 極真会 on his gi")}
      <div class="kanji" aria-hidden="true">極真会</div>
      <p class="quote-hand">Train the body, master the mind.</p>
    </div>
  </div>
</section>

<section class="sec sec--alt">
  <div class="wrap">
    {syl("syllabus-karate.jpg","Kyokushin Karate","Traditional karate","Discipline · Strength · Spirit",[("Kihon — basics","Stances, blocks, punches, kicks","Month 1–3"),("Kata","Taikyoku, Pinan and Sanchin forms","Month 3–6"),("Kumite","Controlled sparring and distance","Month 4+"),("Conditioning","Tameshiwari prep, body hardening","Ongoing"),("Japanese terminology","Commands, counting and etiquette","Ongoing")])}
    {syl("syllabus-selfdefense.jpg","Self Defense","Practical skills","Awareness · Escape · Confidence",[("Awareness","Avoiding and de-escalating danger","Week 1–2"),("Escapes","Wrist grabs, chokes and holds","Week 2–6"),("Strikes","Simple, effective counters","Week 3–8"),("Ground defense","Getting up safely","Week 6–10"),("Scenarios","Pressure-tested drills","Week 8+")])}
    {syl("syllabus-weightloss.jpg","Weight Loss","Fitness programme","Burn fat · Build stamina",[("Assessment","Weight, fitness test and goals","Week 1"),("Cardio conditioning","Pad work and skipping","Week 1–4"),("Strength circuits","Body-weight and kettlebell","Week 2–8"),("Nutrition basics","Simple, local meal guidance","Ongoing"),("Progress check","Re-test every 4 weeks","Monthly")])}
    {syl("syllabus-mental.jpg","Mental Health","Mind &amp; focus","Calm · Resilience · Focus",[("Mokuso","Seated meditation and breathing","Week 1+"),("Stress release","Bag work and movement","Week 1–4"),("Focus drills","Concentration under pressure","Week 2–8"),("Goal setting","Small wins, tracked weekly","Ongoing"),("Community","Training with the dojo family","Ongoing")])}
  </div>
</section>

<section class="bar-cta">
  <div class="wrap bar-cta__in"><h2>Build a stronger, healthier, more confident <span class="red">you.</span></h2><a class="btn btn--red" href="index.html#trial">Join now {ARROW}</a></div>
</section>
'''

# =====================================================================  BELT TEST
def belt_svg(c, stripe="#000", knot_dark="rgba(0,0,0,.18)", tip=None):
    tipc = tip or c
    return f'''<svg viewBox="0 0 130 110" aria-hidden="true"><g stroke="rgba(0,0,0,.25)" stroke-width="1">
<rect x="6" y="12" width="118" height="22" rx="3" fill="{c}"/><path d="M48 30 30 100h18l14-60z" fill="{c}"/><path d="M82 30l18 70H82L68 40z" fill="{c}"/>
<rect x="30" y="88" width="18" height="12" fill="{tipc}"/><rect x="82" y="88" width="18" height="12" fill="{tipc}"/>
<rect x="50" y="6" width="30" height="34" rx="5" fill="{c}"/><rect x="50" y="6" width="30" height="34" rx="5" fill="{knot_dark}"/></g>
<path d="M8 17h114M8 29h114" stroke="rgba(0,0,0,.12)"/></svg>'''
BELTS = [("10 kyu","White belt","#F4F2EE","Beginner","The start of the journey. Etiquette, basic stances, punches and blocks."),
         ("9 kyu","Yellow belt","#F2C318","3 months","Basic kicks, first kata and the Japanese counting system."),
         ("8 kyu","Orange belt","#EE7A1E","3 months","Stronger stances, combinations and Taikyoku kata."),
         ("7 kyu","Green belt","#1E8A44","4 months","Kumite fundamentals, Pinan kata and improved conditioning."),
         ("6 kyu","Blue belt","#1F5FC4","4 months","Controlled sparring, Sanchin breathing and timing."),
         ("5 kyu","Purple belt","#7A3FB3","6 months","Advanced combinations, endurance and kata detail."),
         ("3 kyu","Brown belt","#7A4A26","6–12 months","Senior grade: teaching juniors, full kumite and advanced kata."),
         ("1st Dan","Black belt","#151517","3+ years","Mastery of the basics. The real journey begins.")]
belts_html = "".join(f'''<div class="belt-row rv"><div class="belt-pic">{belt_svg(c, tip="#c9a227" if n=="Black belt" else None)}</div>
<div class="belt-name"><small>{k}</small><b>{n}</b><span>{t}</span></div><p>{d}</p></div>''' for k,n,c,t,d in BELTS)
belt = f'''
<section class="sec" style="padding-top:clamp(40px,6vw,72px)">
  <div class="wrap belt-layout">
    <aside class="belt-aside">
      <p class="eyebrow">Belt test</p>
      <h1>The journey of a black belt begins with a <span class="red">white belt.</span></h1>
      <p>Every belt is earned, never given. Gradings test technique, kata, fitness and spirit in front of Shihan Raja.</p>
      <ul class="plain crit">
        <li>{ic("fist")}<div><b>Technique</b><span>Kihon done with power and form</span></div></li>
        <li>{ic("book")}<div><b>Kata</b><span>Forms for your grade, from memory</span></div></li>
        <li>{ic("dumbbell")}<div><b>Fitness</b><span>Push-ups, squats and endurance</span></div></li>
        <li>{ic("star")}<div><b>Spirit</b><span>Attitude, attendance and respect</span></div></li>
      </ul>
      <p class="quote-hand">More than belts,<br>it's a better you.</p>
      <div class="kanji" aria-hidden="true">極真会</div>
    </aside>
    <div>
      <!-- TODO: confirm the belt order and timings used at your dojo -->
      <div class="belt-list">{belts_html}</div>
      <div class="card next-belt rv"><div><p class="eyebrow">Ready to grade?</p><h2 style="margin-top:8px">Your next belt <span class="red">awaits.</span></h2><p style="margin-top:6px">Ask your instructor when you're eligible for the next test.</p></div><a class="btn btn--red" data-wa="Assalam o Alaikum! I'd like to ask about the next belt test." href="#">Ask about grading {ARROW}</a></div>
    </div>
  </div>
</section>
'''

# =====================================================================  TERMINOLOGY
TERMS = {
 ("Stances","立ち方 · Dachi"):[("stance-zenkutsu.jpg","Zenkutsu-dachi","前屈立ち","Forward stance. Front knee bent, back leg straight, weight about 60% on the front leg."),
   ("stance-kiba.jpg","Kiba-dachi","騎馬立ち","Horse-riding stance. Feet wide and parallel, knees pushed out, back straight."),
   ("stance-sanchin.jpg","Sanchin-dachi","三戦立ち","Hourglass stance. Knees pressed in, hips tucked — the root of Sanchin kata."),
   ("stance-kokutsu.jpg","Kokutsu-dachi","後屈立ち","Back stance. Most of the weight on the back leg, ready to block and counter."),
   ("stance-fudo.jpg","Fudo-dachi","不動立ち","Ready stance used in kumite and to begin many exercises."),
   ("stance-musubi.jpg","Musubi-dachi","結び立ち","Formal attention stance. Heels together, toes apart — used when bowing.")],
 ("Blocks","受け · Uke"):[("block-jodan.jpg","Jodan-uke","上段受け","Rising block that protects the head by sweeping the forearm upward."),
   ("block-soto.jpg","Chudan soto-uke","中段外受け","Middle block from outside to inside, protecting the chest."),
   ("block-uchi.jpg","Chudan uchi-uke","中段内受け","Middle block from inside to outside."),
   ("block-gedan.jpg","Gedan-barai","下段払い","Downward sweeping block against low punches and kicks."),
   ("block-mawashi.jpg","Mae mawashi-uke","前回し受け","Circular two-handed block, signature of Kyokushin.")],
 ("Hand Strikes","突き · Tsuki"):[("strike-seiken.jpg","Seiken chudan-tsuki","正拳中段突き","Straight punch to the body with the first two knuckles."),
   ("strike-oi.jpg","Oi-zuki","追い突き","Lunge punch, stepping forward with the punching side."),
   ("strike-gyaku.jpg","Gyaku-zuki","逆突き","Reverse punch from the back hand, driven by the hips."),
   ("strike-shita.jpg","Shita-tsuki","下突き","Upward punch to the ribs or stomach — a Kyokushin favourite."),
   ("strike-uraken.jpg","Uraken ganmen-uchi","裏拳顔面打ち","Back-fist strike to the face."),
   ("strike-tettsui.jpg","Tettsui","鉄槌","Hammer-fist strike with the bottom of the fist.")],
 ("Kicks","蹴り · Geri"):[("kick-mae.jpg","Mae-geri","前蹴り","Front kick with the ball of the foot."),
   ("kick-mawashi.jpg","Mawashi-geri","回し蹴り","Roundhouse kick with the shin or instep."),
   ("kick-yoko.jpg","Yoko-geri","横蹴り","Side kick with the edge of the foot."),
   ("kick-ushiro.jpg","Ushiro-geri","後ろ蹴り","Back kick driving the heel behind you."),
   ("kick-hiza.jpg","Hiza-geri","膝蹴り","Knee strike, close range."),
   ("kick-kakato.jpg","Kakato-otoshi","踵落とし","Axe kick bringing the heel down from above.")],
 ("Kata","型 · Forms"):[("kata-taikyoku.jpg","Taikyoku Sono Ichi","太極その一","First kata learned — blocks and punches on an H-shaped pattern."),
   ("kata-pinan.jpg","Pinan Sono Ichi","平安その一","The Pinan series builds flow, balance and combinations."),
   ("kata-sanchin.jpg","Sanchin","三戦","Breathing and tension kata that builds power and focus."),
   ("kata-tsuki.jpg","Tsuki no Kata","突きの型","A kata of punches, training speed and accuracy."),
   ("kata-gekisai.jpg","Gekisai Dai","撃砕大","Advanced kata of powerful, decisive techniques.")],
 ("Combinations","連続技 · Renzoku waza"):[("combo-ichini.jpg","Ichi-ni (jodan – chudan)","上段・中段","Two punches: one to the head, one to the body."),
   ("combo-punchkick.jpg","Gyaku-zuki – Mawashi-geri","逆突き・回し蹴り","Reverse punch followed by a roundhouse kick."),
   ("combo-shita.jpg","Shita-tsuki – Gedan mawashi","下突き・下段回し","Body punch into a low kick — a kumite classic."),
   ("combo-block.jpg","Uke – Gyaku-zuki","受け・逆突き","Block and counter in one movement.")],
}
def term_cat(cat, items):
    name, jp = cat
    kind = name[:-1] if name.endswith("s") and name != "Kata" else name
    lis = "".join(f'<li data-img="{f}" data-kind="{kind}"><h3>{n}</h3><span class="jp">{j}</span><p>{d}</p></li>' for f,n,j,d in items)
    side = lambda cls, ico: f'<button class="term-side {cls}" type="button"><div class="ph" data-file=""></div><span class="arrow">{svg(ico)}</span></button>'
    return f'''<section class="term-cat" data-term aria-label="{name}">
  <div class="term-cat__head"><h2>{name}<small>{jp}</small></h2><p class="term-count"><span>01 / {len(items):02d}</span><i></i></p></div>
  <ul class="term-data">{lis}</ul>
  <div class="term-slider" tabindex="0" hidden>{side("term-side--prev","left")}<div class="ph term-main" data-file=""></div><div class="card term-info"></div>{side("term-side--next","right")}<div class="term-dots"></div></div>
</section>'''
terms_html = "".join(term_cat(c, i) for c, i in TERMS.items())
term = f'''
<section class="term-hero on-dark">
  {ph("terminology-hero.jpg","ph--dark","Karateka tying a black belt")}
  <div class="wrap" style="width:100%"><div class="term-hero__copy">
    <p class="crumbs">Learn <span>/</span> Terminology</p>
    <h1>Kyokushin Techniques &amp; <span class="red">Terminology</span></h1>
    <p class="lede">Explore the fundamental stances, blocks, strikes, kicks and kata of Kyokushin Karate. Learn the correct Japanese terms and the purpose behind each technique.</p>
  </div></div>
  <div class="kanji" aria-hidden="true">極真会</div>
</section>
<section class="sec" style="padding-top:clamp(24px,3vw,40px)"><div class="wrap">{terms_html}</div></section>
<section class="master on-dark">
  {ph("master-bg.jpg","ph--dark","")}
  <div class="wrap master__in"><div><p class="crumbs">Stances <span>›</span> Blocks <span>›</span> Strikes <span>›</span> Kicks</p><h2 class="h-md" style="margin-top:8px">Master the fundamentals</h2><p class="lede" style="margin-top:6px">Build a strong foundation with proper technique, discipline and guidance from certified instructors.</p></div>
  <a class="btn btn--red" href="index.html#trial">Join our classes {ARROW}</a></div>
</section>
'''

PAGES = [
 ("index.html","Raja's Martial Arts — More Than Just a Martial Art | Kyokushin Karate","Kyokushin Karate, self defense and fitness under Shihan Raja Khalid Mehmood Janjua. Book a free trial class.",home,False),
 ("biography.html","Shihan Raja Khalid Mehmood Janjua — Biography | Raja's Martial Arts","The story of Shihan Raja Khalid Mehmood Janjua, founder of Raja's Martial Arts — a life built on Kyokushin discipline.",bio,True),
 ("instructors.html","Our Instructors — Experience, Discipline, Guidance | Raja's Martial Arts","Meet the certified Kyokushin instructors and coaches of Raja's Martial Arts.",instr,False),
 ("courses.html","Courses & Fees — Kyokushin, Self Defense, Weight Loss | Raja's Martial Arts","Kyokushin Karate, self defense, weight loss and mental health courses, PKR 8,000 a month, PKR 7,000 for families, personal training PKR 25,000. Bahria Town Civic Center, Islamabad.",courses,True),
 ("syllabus.html","Syllabus — Your Journey, Our Syllabus | Raja's Martial Arts","Module-by-module syllabus for every course at Raja's Martial Arts.",syllabus,False),
 ("belt-test.html","Belt Test — From White Belt to Black Belt | Raja's Martial Arts","Kyokushin belt ranks, grading requirements and timings at Raja's Martial Arts.",belt,False),
 ("terminology.html","Kyokushin Techniques & Terminology | Raja's Martial Arts","Japanese names and meanings of Kyokushin stances, blocks, strikes, kicks, kata and combinations.",term,True),
]
for f, t, d, b, dark in PAGES:
    with open(os.path.join(OUT, f), "w") as fh: fh.write(page(f, t, d, b, dark))
for c in INSTRUCTORS:
    nm = html.unescape(c["name"])
    with open(os.path.join(OUT, prof_url(c)), "w") as fh:
        fh.write(page(prof_url(c), f"{nm} — {html.unescape(c['role'])} | Raja's Martial Arts",
                      f"Profile of {nm}, {html.unescape(c['role'])} at Raja's Martial Arts & Fitness Gym: biography, achievements, club and classes.",
                      profile(c), False, cls="instructors prof", cur="instructors.html"))
print("wrote", len(PAGES) + len(INSTRUCTORS), "pages")
