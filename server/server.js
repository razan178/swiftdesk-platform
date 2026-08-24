/* ==========================================================================
   Laiba Institute — Lead-capture backend
   --------------------------------------------------------------------------
   A tiny, dependency-light Express server that:
     1. Serves the static website (index.html, css, js, assets).
     2. Accepts leads at POST /api/lead — validates, saves a durable copy to
        data/leads.ndjson, and (optionally) forwards each lead to a webhook
        and/or an email inbox. The visitor is still sent to WhatsApp by the
        frontend, so capture here is a safety net, never a blocker.
     3. Lets the owner review captured leads at /admin (protected by a token).

   Everything is configured through environment variables — see .env.example.
   No database required; leads append to a newline-delimited JSON file.
   ========================================================================== */

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.ndjson");

const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";           // protects /admin & /api/leads
const LEAD_WEBHOOK_URL = process.env.LEAD_WEBHOOK_URL || ""; // optional: forward each lead (Zapier/Make/Sheet/CRM)

fs.mkdirSync(DATA_DIR, { recursive: true });

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));

/* ---- tiny in-memory rate limit (per IP) to deter spam ------------------- */
const hits = new Map();
function rateLimit(ip, max = 8, windowMs = 60_000) {
  const now = Date.now();
  const rec = hits.get(ip) || { n: 0, t: now };
  if (now - rec.t > windowMs) { rec.n = 0; rec.t = now; }
  rec.n += 1; hits.set(ip, rec);
  return rec.n <= max;
}

/* ---- validation --------------------------------------------------------- */
function cleanLead(b = {}) {
  const s = (v, n = 120) => String(v == null ? "" : v).trim().slice(0, n);
  const digits = (v) => s(v).replace(/[^0-9+]/g, "");
  const lead = {
    name: s(b.name, 80),
    phone: digits(b.phone),
    country: s(b.country, 60),
    timing: s(b.timing, 40),
    exam: s(b.exam, 20),
    goal: s(b.goal, 60),
  };
  const errors = [];
  if (lead.name.length < 2) errors.push("name");
  if (lead.phone.replace(/[^0-9]/g, "").length < 10) errors.push("phone");
  if (!lead.country) errors.push("country");
  if (!lead.timing) errors.push("timing");
  if (!lead.exam) errors.push("exam");
  return { lead, errors };
}

/* ---- optional forwarders (fire-and-forget) ------------------------------ */
async function forwardLead(record) {
  if (LEAD_WEBHOOK_URL) {
    try {
      await fetch(LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
    } catch (e) { console.error("[webhook] failed:", e.message); }
  }
  // To email leads, point LEAD_WEBHOOK_URL at a small email relay (e.g. a
  // Google Apps Script Web App or a service like Resend/Zapier). Kept out of
  // core so there are no SMTP credentials in the codebase.
}

/* ======================= API ======================= */
app.post("/api/lead", async (req, res) => {
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  if (!rateLimit(ip)) return res.status(429).json({ ok: false, error: "Too many requests. Please try again shortly." });

  const { lead, errors } = cleanLead(req.body);
  if (errors.length) return res.status(400).json({ ok: false, errors });

  const record = {
    ...lead,
    at: new Date().toISOString(),
    ip,
    ua: String(req.headers["user-agent"] || "").slice(0, 200),
  };

  try {
    fs.appendFileSync(LEADS_FILE, JSON.stringify(record) + "\n");
  } catch (e) {
    console.error("[save] failed:", e.message);
    // Don't fail the visitor — WhatsApp is still their path forward.
  }
  forwardLead(record); // fire-and-forget

  return res.json({ ok: true });
});

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "laiba-leads", time: new Date().toISOString() }));

/* ---- owner-only: review captured leads ---------------------------------- */
function checkAuth(req) {
  if (!ADMIN_TOKEN) return false;
  const t = req.query.token || (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  return t && t === ADMIN_TOKEN;
}

app.get("/api/leads", (req, res) => {
  if (!checkAuth(req)) return res.status(401).json({ ok: false, error: "Unauthorized" });
  const rows = fs.existsSync(LEADS_FILE)
    ? fs.readFileSync(LEADS_FILE, "utf8").trim().split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean)
    : [];
  res.json({ ok: true, count: rows.length, leads: rows.reverse() });
});

app.get("/admin", (req, res) => {
  if (!ADMIN_TOKEN) return res.status(503).send("Set ADMIN_TOKEN in the environment to enable the admin view.");
  res.sendFile(path.join(__dirname, "admin.html"));
});

/* ---- static site (served last so /api/* wins) --------------------------- */
app.use(express.static(ROOT, { extensions: ["html"], maxAge: "1h" }));

app.listen(PORT, () => {
  console.log(`Laiba Institute site + lead API running on http://localhost:${PORT}`);
  if (!ADMIN_TOKEN) console.log("• Tip: set ADMIN_TOKEN to enable /admin lead review.");
});
