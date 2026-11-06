# Mobileria Dardania

An online furniture store for **Mobileria Dardania**, with a full shopping flow for customers and an admin dashboard for managing products, categories and orders.

Built with **Next.js 16**, **React 19**, **TypeScript** and **Supabase**.

## Features

**Storefront**
- Home page with a hero slider and featured furniture
- Shop page with search, category filters, sorting and pagination
- Product detail pages with image carousels
- Cart, wishlist (works for guests and signed-in users) and checkout
- Customer accounts: register, log in, profile and order history
- Order requests sent by email (EmailJS) and a WhatsApp contact button

**Admin dashboard**
- Sales and order statistics with charts and category breakdowns
- Create, edit and delete furniture and products with image uploads
- Custom product fields built with a drag-and-drop field builder
- Category management
- Order request management
- Store settings

## Tech stack

| Area | Tools |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS, shadcn/ui (Radix UI), Lucide icons, Embla Carousel, Recharts |
| Forms | React Hook Form, Zod |
| Backend | Next.js API routes, Supabase (Postgres + Auth) |
| Storage | Vercel Blob (product images) |
| Email | EmailJS |
| Analytics | Vercel Analytics |

## Project structure

```
app/
  (storefront)   page.tsx, shop/, products/[slug]/, furniture/[id]/, cart/, checkout/, wishlist/
  account/       login, register, profile, orders
  admin/         dashboard, products, furniture, categories, settings
  api/           cart, categories, furniture, orders, products, settings, uploads, wishlist
components/      UI and feature components (admin/, providers/, ui/)
lib/             Supabase clients, email helper, types, utils
scripts/         SQL migrations and the admin-user setup script
```

## Getting started

### Prerequisites
- Node.js 18+
- [pnpm](https://pnpm.io/)
- A [Supabase](https://supabase.com/) project
- A Vercel Blob store (for image uploads)
- An EmailJS account (for order emails)

### 1. Install
```bash
git clone https://github.com/iligashi/MoblieriaDardania.git
cd MoblieriaDardania
pnpm install
```

### 2. Environment variables
Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

BLOB_READ_WRITE_TOKEN=

NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=

NEXT_PUBLIC_WHATSAPP_NUMBER=
```

### 3. Database
Run the SQL files in `scripts/` in order (`001` → `007`) in the Supabase SQL editor. Then create the first admin account:

```bash
npx tsx scripts/create-admin-user.ts
```

### 4. Run
```bash
pnpm dev
```
Open http://localhost:3000. The admin panel is at `/admin`.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm build` | Build for production |
| `pnpm start` | Run the production build |
| `pnpm lint` | Run ESLint |

## Deployment

Designed to deploy on [Vercel](https://vercel.com/). Add the environment variables above in the Vercel project settings.

---

Built by [Ilaz Gashi](https://github.com/iligashi) · [Nexora Agency](https://nexoraagency.llc/)
