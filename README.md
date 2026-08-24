# Laiba Institute — IELTS & PTE Lead-Generation Website

A premium, conversion-focused single-page site whose only job is to turn visitors
into **high-intent WhatsApp leads**. Static, zero-dependency (HTML + CSS + vanilla
JS) — fast, SEO-friendly, and trivially easy to edit.

> **"Laiba Institute" is a placeholder brand name.** Replace it when you finalise yours
> (see step 2 below).

---

## 🚀 Run it

No build step. Just open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

---

## ✏️ First things to change (in order)

Almost everything business-specific lives in **`js/config.js`** — edit that first.

1. **WhatsApp number** — `js/config.js` → `WHATSAPP_NUMBER`
   Use full international format, digits only, no `+`.
   Example: `+92 300 1234567` → `"923001234567"`. *(This is the #1 thing to set —
   the entire site funnels here.)*

2. **Brand name** — set `BRAND.name` in `js/config.js`, then do a global
   find-and-replace of the word **`Laiba Institute`** in `index.html` (it appears in the
   visible text, `<title>`, meta tags and schema for SEO).

3. **Phone number** — `js/config.js` → `PHONE_NUMBER` (shown) and `PHONE_DIAL` (dialled).

4. **Domain** — replace `https://www.example.com` in `index.html`, `robots.txt`
   and `sitemap.xml` with your real domain (used by canonical, Open Graph & sitemap).

5. **Social links & email** — `js/config.js` → `SOCIAL`. Leave a value as `"#"`
   to hide that icon automatically.

---

## 📝 Replace placeholder content (clearly marked in `index.html`)

All of these are **placeholders** — nothing is fabricated as real. Search
`index.html` for the bracketed `[ ... ]` text:

| Section | What to add |
|---|---|
| **Results** (`#results`) | Real, verified student scores, names & goals |
| **Testimonials** (`#testimonials`) | Genuine, permission-based reviews (name, exam, goal, optional photo) |
| **Teachers** (`#teachers`) | Real instructor photos, names, roles, bios, specialisations |

To add a teacher/testimonial photo, drop the image in `assets/` and replace the
placeholder icon block with an `<img src="assets/your-photo.jpg" alt="...">`.

**Do not present placeholders as real** until you've swapped in genuine content.

---

## 💬 How the lead → WhatsApp flow works

1. Visitor fills the short form (**Name, WhatsApp, Country, Timing, Exam**, optional Goal).
2. On submit, JS validates inline (no data loss on error).
3. A personalised WhatsApp message is built from their answers using the
   `WHATSAPP_MESSAGE_TEMPLATE` in `config.js` and they're redirected to
   `wa.me/<your-number>` with the message pre-filled.
4. You continue the conversation and close the lead personally.

Edit the message wording in `config.js` → `WHATSAPP_MESSAGE_TEMPLATE`
(placeholders `{name} {exam} {country} {timing} {goal}` are auto-filled).

---

## 📊 Analytics & conversion tracking

Add your IDs in `js/config.js` → `ANALYTICS` and tracking loads automatically:

- `GA4_MEASUREMENT_ID` → loads Google Analytics 4
- `META_PIXEL_ID` → loads the Meta (Facebook) Pixel

Events already fired (see `track()` in `js/main.js`): `cta_click`, `form_started`,
`form_submitted`, `generate_lead`, `whatsapp_click`, `phone_click`. With no IDs set,
events are logged to the browser console so you can verify them.

---

## 🔌 Connecting a CRM / Google Sheet / WhatsApp API later

The form currently redirects straight to WhatsApp (no backend needed). To ALSO
capture leads in a CRM/Sheet, add one `fetch()` inside the `form.submit` handler in
`js/main.js` (marked area, right before the WhatsApp redirect) posting the `data`
object to your endpoint (e.g. a Google Apps Script Web App, Zapier/Make webhook, or
your own API). The redirect still happens either way.

---

## 📁 Structure

```
index.html          # the landing page (semantic sections, SEO meta, schema)
css/styles.css      # design system + all components
js/config.js        # ⭐ all business info (edit this first)
js/main.js          # nav, accordion, animations, form + WhatsApp flow, analytics
assets/             # favicon, social share image (replace with your own)
robots.txt / sitemap.xml / site.webmanifest
```

---

## ✅ Not included on purpose

No fake countdowns, fake scarcity, fake "people viewing" notifications, invented
testimonials, scores, or reviews. The prominent price is intentionally kept off the
page — pricing is discussed privately on WhatsApp.
