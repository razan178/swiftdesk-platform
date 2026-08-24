# Laiba Institute — IELTS & PTE Website

A premium, conversion-focused website whose job is to turn visitors into
**high-intent WhatsApp leads** — with a lightweight **lead-capture backend** so
no enquiry is ever lost. Frontend is zero-dependency (HTML + CSS + vanilla JS);
the optional backend is a tiny Express server.

- **Frontend:** fast, SEO-ready, mobile-first, light/dark aware.
- **Backend:** captures every form submission (safety net) alongside the
  WhatsApp hand-off, with a protected admin dashboard to review/export leads.
- **Deploy:** run as a full-stack app (Render / Railway / Docker / any VPS) or
  as pure static files (Netlify / Vercel / GitHub Pages) — the form works both
  ways.

---

## 🚀 Run it

**Full-stack (recommended — captures leads):**
```bash
npm install
ADMIN_TOKEN=your-secret npm start
# open http://localhost:3000  ·  leads dashboard at http://localhost:3000/admin
```

**Static only (no backend, WhatsApp still works):**
```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

---

## 🔑 Business settings — `js/config.js` (edit this first)

The single source of truth. Already set for Laiba Institute:
- **`WHATSAPP_NUMBER`** → `923435171933`
- **`PHONE_NUMBER` / `PHONE_DIAL`** → `+92 343 5171933`
- **`BRAND.name`** → `Laiba Institute`
- `SOCIAL` links & `ANALYTICS` IDs (GA4 / Meta Pixel) — fill in when ready.
- `WHATSAPP_MESSAGE_TEMPLATE` — the pre-filled message wording.

---

## 🖼️ The hero photo (last step)

The hero references **`assets/hero-student.jpg`** and shows a tasteful
placeholder until that file exists. To make your photo live, commit it to this
branch at exactly that path:
- On GitHub: open the branch → `assets/` folder → **Add file → Upload files** →
  upload your image renamed to **`hero-student.jpg`** → **Commit** to
  `claude/ielts-pte-lead-gen-site-nhkmta`.
- Or drop it into `assets/` locally and `git add assets/hero-student.jpg`.

It then appears automatically — no code change needed.

---

## 💬 Lead flow

1. Visitor fills the short form (Name, WhatsApp, Country, Timing, Exam, optional Goal).
2. JS validates inline (no data lost on error).
3. On submit the site **both**:
   - `POST`s the lead to `/api/lead` (captured server-side — best-effort, never blocks), and
   - opens **WhatsApp** with a personalised, pre-filled message to your number.
4. You continue on WhatsApp and close the lead — and every enquiry is also
   saved for you to follow up.

If hosted as static files (no backend), step 3's POST simply no-ops and the
WhatsApp hand-off still happens.

---

## 🗄️ Backend API (`server/server.js`)

| Route | Purpose |
|---|---|
| `POST /api/lead` | Validate + store a lead (`data/leads.ndjson`), optional webhook forward. Rate-limited. |
| `GET /api/leads?token=…` | JSON of all leads (needs `ADMIN_TOKEN`). |
| `GET /admin` | Dashboard to view & export leads to CSV (needs `ADMIN_TOKEN`). |
| `GET /api/health` | Health check. |

**Environment** (see `.env.example`):
- `ADMIN_TOKEN` — protects `/admin` and `/api/leads` (set a long random string).
- `LEAD_WEBHOOK_URL` — optional: forward every lead to Zapier / Make / a Google
  Apps Script / your CRM. Leave blank to only store locally.
- `PORT` — usually set by the host automatically.

Leads and `node_modules` are git-ignored — customer data is never committed.

---

## ☁️ Deploy

- **Render:** push repo → *New → Blueprint* (uses `render.yaml`); set `ADMIN_TOKEN`.
- **Railway / Fly / any Node host:** start command `node server/server.js` (also in `Procfile`).
- **Docker:** `docker build -t laiba . && docker run -p 3000:3000 -e ADMIN_TOKEN=… laiba`.
- **Static hosts (Netlify / Vercel / GitHub Pages):** deploy the repo root; the
  site works, leads go to WhatsApp only (set `LEAD_WEBHOOK_URL` isn't available
  without the backend — use the full-stack option to capture leads).
- **Domain:** replace `https://www.example.com` in `index.html`, `robots.txt`
  and `sitemap.xml` with your real domain.

---

## 📝 Replace placeholder content (clearly marked in `index.html`)

Nothing is fabricated as real. Search `index.html` for bracketed `[ ... ]` text:

| Section | Add |
|---|---|
| **Results** | Verified student scores, names & goals |
| **Testimonials** | Genuine, permission-based reviews |
| **Teachers** | Real instructor photos, names, roles, bios |

---

## 📁 Structure

```
index.html            # landing page (SEO meta, schema, all sections)
css/styles.css        # design system + components
js/config.js          # ⭐ all business info (edit first)
js/main.js            # nav, accordion, form → capture + WhatsApp, analytics
server/server.js      # lead-capture API + static server
server/admin.html     # leads dashboard (token-protected)
assets/               # favicon, og-image, hero photo
Dockerfile · render.yaml · Procfile · .env.example
academy-hero.html     # standalone alternative hero (bonus)
```

---

## ✅ Not included on purpose

No fake countdowns, fake scarcity, fake "people viewing" popups, or invented
testimonials/scores/reviews. Pricing is discussed privately on WhatsApp.
