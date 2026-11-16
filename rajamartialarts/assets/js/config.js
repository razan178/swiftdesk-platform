/* ==========================================================================
   RAJA'S MARTIAL ARTS — SITE SETTINGS
   This is the ONE file to edit for contact details. Everything on the site
   (WhatsApp buttons, join form, footer, map) reads from here.
   Lines marked TODO still hold placeholder values.
   ========================================================================== */
window.RAJA = {
  // WhatsApp number in international format, digits only, no + or spaces.
  // Example for Pakistan: 923001234567
  whatsapp: "920000000000", // TODO: real WhatsApp number

  // How the number is shown on the page
  phoneDisplay: "+92 300 0000000", // TODO: real number

  email: "", // optional, e.g. "info@rajamartialarts.com"

  address: {
    line1: "Street / building — TODO", // TODO: real street address
    city: "City — TODO",               // TODO: city
    country: "Pakistan"
  },

  // Map pin. Leave both as null to show a placeholder instead of a map.
  // Get them from Google Maps: right-click the dojo → click the numbers.
  lat: null, // TODO: e.g. 33.6844
  lng: null, // TODO: e.g. 73.0479

  // Social links — leave "" to hide the icon
  instagram: "",
  facebook: "",
  youtube: ""
};
