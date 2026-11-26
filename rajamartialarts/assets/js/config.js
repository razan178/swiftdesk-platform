/* ==========================================================================
   RAJA'S MARTIAL ARTS — SITE SETTINGS
   This is the ONE file to edit for contact details. Everything on the site
   (WhatsApp buttons, trial form, footer, map) reads from here.
   ========================================================================== */
window.RAJA = {
  // WhatsApp number in international format, digits only (92 = Pakistan, drop the leading 0).
  // TODO: the number supplied was "0343517193" — that is 10 digits, a Pakistani mobile
  // number has 11 (0343 + 7 digits). Please confirm the missing digit, then fix both lines.
  whatsapp: "92343517193",
  phoneDisplay: "0343 517193",

  email: "", // optional, e.g. "info@rajamartialarts.com"

  address: {
    line1: "Raja's Martial Arts, Civic Center, Bahria Town",
    city: "Islamabad",
    country: "Pakistan"
  },

  // Map: Google Maps search used for the embedded map and the "Get directions" link.
  mapQuery: "Raja Martial Arts, Civic Center, Bahria Town, Islamabad",
  // Optional exact pin — if set, these are used instead of the search above.
  lat: null,
  lng: null,

  // Social links — leave "" to hide the icon
  instagram: "",
  facebook: "",
  youtube: "",

  // Backend (Supabase project "rajas-martial-arts"). The publishable key is safe to
  // ship in the browser: database rules only let visitors ADD a trial booking —
  // they can't read or change anything. Admin panel: admin.html
  supabaseUrl: "https://nouqkqqwmnvdthujxauo.supabase.co",
  supabaseKey: "sb_publishable_zZ-D05ljV0ZRlzV0MAsGPg_Pw4oLAgC"
};
