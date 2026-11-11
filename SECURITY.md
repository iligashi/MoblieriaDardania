# Security Policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Email **info@fluxdekor.com** with:

- a description of the issue and its impact,
- the steps or a request needed to reproduce it,
- any logs, screenshots or proof-of-concept code.

You will get an acknowledgement within **3 working days** and a status update within **10 working days**. Please give us a reasonable time to fix the issue before disclosing it. We will credit you in the fix unless you ask us not to.

Only test against your own account and data. Do not access other customers' data, degrade the service, or run automated scanners against production.

## Supported versions

Only the `main` branch, which is deployed to [flux-dekor.com](https://flux-dekor.com), receives security fixes.

## How the application is protected

| Area | Control |
|---|---|
| **Authentication** | Supabase Auth. Admin access needs a session **and** a row in `admin_users`. This is checked in `proxy.ts`, in the admin layout, and again in every admin API route. Admins can only be created with the service-role script. |
| **Authorisation** | Row Level Security on every table. Customer data (orders, carts, wishlists, addresses, profiles) is only readable by its owner or an admin. The service-role key is used only on the server, and only after an ownership or admin check. |
| **Pricing and stock** | The server computes prices, shipping and totals from the database. Stock is reserved atomically (`decrement_stock`) **before** the order is written, and released if the order fails. |
| **Input validation** | Every API route validates its body with Zod. Unknown fields are dropped. Search and slug input is sanitised before reaching PostgREST filters. |
| **CSRF** | Session cookies are `SameSite=Lax`, and `proxy.ts` rejects state-changing `/api` requests from other origins. |
| **XSS and clickjacking** | A strict Content-Security-Policy, `X-Frame-Options: DENY`, `frame-ancestors 'none'`, and escaped JSON-LD. No user HTML is ever rendered. |
| **Transport** | HSTS (2 years, preload), `upgrade-insecure-requests`, and Cross-Origin-Opener-Policy. |
| **Abuse** | Database-backed rate limits on checkout, cart, wishlist and uploads. IPs are stored only as hashes. A honeypot field filters checkout bots. |
| **Uploads** | Admin only. Only JPG, PNG, WebP, AVIF and GIF, verified by the file's magic bytes. 4.5 MB maximum. The server picks the file name and extension. |
| **Caching** | API responses are `Cache-Control: private, no-store`, except the public category list. |
| **Dependencies** | Pinned versions, a patched lockfile, and a CI job that fails on known vulnerabilities. Dependabot keeps dependencies and Actions up to date. |

## Operational checklist

Settings that live outside the code and must be configured in the dashboards:

- **Supabase → Authentication → Providers → Email:** turn on *Confirm email*.
- **Supabase → Authentication → Policies:** minimum password length 10, and turn on *Leaked password protection*.
- **Supabase → API keys:** rotate the secret (service-role) key if it has ever been shared, then update `SUPABASE_SERVICE_ROLE_KEY` in Vercel.
- **Admin accounts:** use a real staff email and a unique password of 12+ characters. Remove anyone who is no longer staff from `admin_users`.
- **Vercel:** keep Deployment Protection on for preview deployments.
