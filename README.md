# Islamabad Thrift Store

A modern e-commerce store for a pre-owned / thrift shoe business serving
**Islamabad & Rawalpindi**. Customers browse shoes and order through WhatsApp;
the owner manages inventory from a simple private admin dashboard.

- **Storefront:** Home, Shop (with filters), Product detail, About, Contact
- **Admin:** Login, Dashboard, Product management, Add/Edit product with photo uploads
- **Ordering:** WhatsApp click-to-chat with a pre-filled order message (no payment gateway)
- **Inventory:** Products are marked **SOLD** manually by the owner after confirming a sale

## Tech stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router, TypeScript) | Fast, SEO-friendly, easy to host |
| Styling | **Tailwind CSS v4** | Bold streetwear UI, no heavy libraries |
| Database + Auth + Image storage | **Supabase** (free tier) | One low-cost service for everything |
| Hosting | **Netlify** | Simple deploys, official Next.js support |

Everything runs on **free tiers** — no monthly cost to start.

---

## ⚙️ One-time setup (about 15 minutes)

You need a free **Supabase** account. Follow these steps in order.

### 1. Create a Supabase project
1. Go to [supabase.com](https://supabase.com) and sign up (free).
2. Click **New project**. Give it a name (e.g. `islamabad-thrift`) and a strong
   database password. Pick the region closest to Pakistan (e.g. *Southeast Asia / Singapore*).
3. Wait ~2 minutes for it to finish setting up.

### 2. Create the database tables
1. In your Supabase project, open **SQL Editor** (left sidebar) → **New query**.
2. Open the file [`supabase/schema.sql`](supabase/schema.sql) from this project,
   copy **all** of it, paste it into the editor, and click **Run**.
3. You should see “Success”. This creates the products table, the security rules,
   and the image storage bucket.

### 3. Create your admin login
1. In Supabase, go to **Authentication** → **Users** → **Add user**.
2. Enter the owner’s **email** and a **strong password**, tick **Auto Confirm User**,
   and save. This email + password is what you’ll use to log in at `/admin`.
3. *(Recommended)* Go to **Authentication → Providers → Email** and turn **off**
   “Enable Sign Ups”, so only users you add can ever log in.

### 4. Get your API keys
1. In Supabase, go to **Project Settings** → **API**.
2. Copy the **Project URL** and the **anon / public** key. You’ll paste these next.
   *(The anon key is safe to expose — your data is protected by the security rules
   from step 2.)*

### 5. Add the keys to the project
Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🖥️ Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the store, and
[http://localhost:3000/admin](http://localhost:3000/admin) to log in and add products.

*(Optional)* To see the store with a few sample products, run
[`supabase/seed.sql`](supabase/seed.sql) in the Supabase SQL Editor. These are clearly
labelled demo items — delete them anytime from the admin dashboard.

---

## 🚀 Deploy to Netlify

1. Push this project to a GitHub repository.
2. On [netlify.com](https://netlify.com): **Add new site → Import an existing project**,
   and choose your repo. Netlify auto-detects Next.js (settings are in `netlify.toml`).
3. Before deploying, add your environment variables under
   **Site configuration → Environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` → your live URL (e.g. `https://your-site.netlify.app`)
4. Click **Deploy**. Done — direct links to product and admin pages work correctly.

> After deploying, add your live URL to Supabase under
> **Authentication → URL Configuration → Site URL** so admin login redirects work.

---

## 🛍️ How the owner uses it

1. Go to **`/admin`** and log in.
2. **Add product** → fill in name, brand, category, size, price, condition, description,
   and upload photos (the first photo is the cover). Click **Publish**.
3. The product appears instantly on the public store.
4. When a customer orders on WhatsApp and you **confirm the sale**, open the product in
   the admin list and click **Mark sold**. It then shows **SOLD** and can’t be ordered.
   Made a mistake? Click **Restore** to bring it back.

Products are **never** marked sold automatically — only you decide, after confirming.

---

## 🎨 Using the client’s logo

The logo is currently a clean text wordmark (in `src/components/Logo.tsx`). To use an
image logo instead, drop the file in `public/` (e.g. `public/logo.svg`) and replace the
wordmark markup with a Next.js `<Image>` — see the comment in that file.

## 🔧 Change store details

All store info — WhatsApp number, service area, delivery fee, categories — lives in one
file: [`src/lib/constants.ts`](src/lib/constants.ts). Edit it there and it updates
everywhere.

---

## Project structure

```
src/
  app/
    (store)/        Public storefront (home, shop, product, about, contact)
    admin/          Login + protected dashboard, product management, add/edit
    sitemap.ts, robots.ts, not-found.tsx, error.tsx
  components/       Reusable UI (ProductCard, Filters, WhatsApp button, admin forms…)
  lib/              constants, types, utils, Supabase clients, product queries
  middleware.ts     Protects /admin and refreshes the login session
supabase/
  schema.sql        Run once to create tables + security + storage
  seed.sql          Optional demo products
```
