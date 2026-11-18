# SwiftDesk agency website

Static build deployed to https://swiftdeskpk.netlify.app (Netlify site `swiftdeskpk`).

- `index.html` holds `SD_CONFIG`: WhatsApp number and the Supabase project URL + public (anon) key.
- The contact form saves each enquiry to the Supabase table `public.leads` (see `leads.sql`) and opens WhatsApp with the brief.
- Visitors can only insert leads; reading them requires the Supabase dashboard.
- `netlify.toml` publishes this folder as-is (no build step).
