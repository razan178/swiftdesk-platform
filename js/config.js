/* ==========================================================================
   MERIDIAN — SITE CONFIGURATION  (EDIT THIS FILE FIRST)
   --------------------------------------------------------------------------
   This is the SINGLE source of truth for every piece of business information
   on the website. You should almost never need to touch the HTML for these.
   Change a value here and it updates everywhere it is used.

   Quick-start replacements:
     1. WHATSAPP_NUMBER   -> your WhatsApp number (international format, no +)
     2. PHONE_NUMBER      -> your phone number for the call button
     3. BRAND.name        -> your final brand name (also do a global find/replace
                             of the word "Laiba Institute" in index.html for SEO text)
   ========================================================================== */

window.SITE_CONFIG = {

  /* ---- PRIMARY CONVERSION CHANNEL -------------------------------------- */
  // WhatsApp number in FULL international format, digits only. NO "+", NO spaces.
  // Example for Pakistan +92 300 1234567  ->  "923001234567"
  WHATSAPP_NUMBER: "923435171933",   // Laiba Institute WhatsApp (92 + 3435171933)

  // Phone number for the secondary "Call" action. Human-readable + dial value.
  PHONE_NUMBER: "+92 343 5171933",   // shown to users
  PHONE_DIAL:   "+923435171933",     // used in tel: link

  /* ---- BRAND ----------------------------------------------------------- */
  BRAND: {
    name:    "Laiba Institute",                       // your brand name
    suffix:  "IELTS & PTE",                     // shown next to the logo
    tagline: "Your international future, one score away.",
  },

  /* ---- SOCIAL / EXTERNAL LINKS (leave "#" to hide gracefully) ---------- */
  SOCIAL: {
    instagram: "#",
    facebook:  "#",
    tiktok:    "#",
    youtube:   "#",
    email:     "hello@example.com",
  },

  /* ---- ANALYTICS ------------------------------------------------------- */
  // Leave IDs blank to disable. When you add a GA4 ID and/or Meta Pixel ID,
  // tracking + conversion events fire automatically (see js/main.js).
  ANALYTICS: {
    GA4_MEASUREMENT_ID: "",   // e.g. "G-XXXXXXXXXX"
    META_PIXEL_ID:      "",   // e.g. "123456789012345"
  },

  /* ---- LEAD FORM WHATSAPP MESSAGE -------------------------------------
     Placeholders {name} {exam} {country} {timing} {goal} are auto-filled
     from the visitor's form input. Edit the wording freely.               */
  WHATSAPP_MESSAGE_TEMPLATE:
    "Hi Laiba Institute 👋\n\n" +
    "I'm {name} and I'd like to plan my preparation.\n\n" +
    "• Exam: {exam}\n" +
    "• Goal: {goal}\n" +
    "• Based in: {country}\n" +
    "• Preferred timing: {timing}\n\n" +
    "Please help me find the right option to get started.",

  // Message used by the floating button / generic "Talk to an expert" links
  // when the visitor hasn't filled the form yet.
  WHATSAPP_GENERIC_MESSAGE:
    "Hi Laiba Institute 👋 I'd like to know more about IELTS / PTE preparation and " +
    "find the right option for my goal.",
};
