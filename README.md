# Flux Dekor

Online store for **Flux Dekor** (furniture, decor and tools, Kosovo) — a customer storefront plus an admin panel for products, categories and orders. Live at [flux-dekor.com](https://flux-dekor.com).

Built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4** and **Supabase**.

## Features

**Storefront**
- Editorial home page, category tiles and product rails (sale, new, bestsellers)
- Shop with search, category + sub-category filters, price/colour/material filters, sorting and pagination (mobile filter sheet)
- Product pages with a swipeable gallery and lightbox, spec accordions, JSON-LD and Open Graph metadata
- Slide-over cart drawer, guest and customer carts, wishlist, live search (`Ctrl K` / `/`)
- Checkout with cash on delivery or bank transfer — **prices, shipping and totals are always computed on the server**
- Customer accounts: register, log in, profile, password change and order history
- WhatsApp ordering, robots.txt and sitemap.xml

**Admin panel** (`/admin`)
- Dashboard: revenue, orders, pending orders, average order value, 30-day revenue chart, top sellers, low stock
- Orders: filter by status, search, order detail panel, status workflow, delete
- Products: search/filter/sort, quick active/featured toggles, full editor with multi-image upload, cover ordering and custom fields
- Categories: tree with sub-categories, ordering, active toggle, tile colour or image
- Settings: material and colour options

## Tech stack

| Area | Tools |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS v4, Radix UI primitives, Lucide icons, Recharts, dnd-kit |
| Validation | Zod (every API route validates its input) |
| Backend | Route handlers, Supabase (Postgres + Auth + RLS) |
| Storage | Vercel Blob (product images) |
| Analytics | Vercel Analytics |

## Project structure

```
app/
  page.tsx, shop/, products/[slug]/, cart/, checkout/, wishlist/   storefront
  account/                    login, register, overview, orders, profile
  admin/login/                admin sign-in
  admin/(panel)/              dashboard, orders, products, categories, settings (guarded by one layout)
  api/                        cart, categories, orders, products, settings, uploads, wishlist
components/                   storefront components; admin/, account/, providers/, ui/
lib/
  auth/admin.ts               admin checks for pages and API routes
  shop-config.ts              shipping rules, contact details, price helpers (shared by client and server)
  validation/                 zod schemas and input sanitisers
  supabase/                   browser, server, service-role clients and middleware
scripts/                      SQL migrations and the admin-user script
```

## Getting started

### Prerequisites
- Node.js 20.9+
- [pnpm](https://pnpm.io/)
- A [Supabase](https://supabase.com/) project
- A Vercel Blob store (for image uploads)

### 1. Install
```bash
git clone https://github.com/iligashi/MoblieriaDardania.git
cd MoblieriaDardania
pnpm install
```

### 2. Environment variables
Copy `.env.example` to `.env.local` and fill it in:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server only — never expose to the browser
BLOB_READ_WRITE_TOKEN=
NEXT_PUBLIC_SITE_URL=https://flux-dekor.com
NEXT_PUBLIC_WHATSAPP_NUMBER=38349514788
```

### 3. Database
Run the SQL files in `scripts/` in order in the Supabase SQL editor:

| File | Purpose |
|---|---|
| `001` – `007` | Base schema: products, admin users, custom fields, settings, orders, e-commerce tables |
| `002` | Removes the old trigger that made every new sign-up an admin |
| `008_security_hardening.sql` | RLS fixes, atomic stock decrement, order-number sequence, constraints. **Required.** Idempotent — safe to re-run |

### 4. Create an admin
Admins are never created by sign-up. Create one explicitly:

```bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-unique-password' pnpm create-admin
```

### 5. Run
```bash
pnpm dev        # http://localhost:3000
pnpm typecheck
pnpm build
```

## Business rules

Shipping cost, the free-shipping threshold, the low-stock warning level and contact details live in `lib/shop-config.ts`. The same values are used for display and for server-side order pricing, so they can't drift apart.

## Deployment

Deployed on Vercel. When a change ships with a new SQL migration, **run the migration in Supabase before deploying the code**.
