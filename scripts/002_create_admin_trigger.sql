-- ============================================================================
-- 002 — (retired)
--
-- This script used to install a trigger that copied EVERY new auth user into
-- admin_users, which gave admin rights to anyone who registered on the shop.
--
-- It now only removes that trigger. Admins are created explicitly with:
--
--   ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/create-admin-user.ts
--
-- See scripts/008_security_hardening.sql for the full set of fixes.
-- ============================================================================

DROP TRIGGER IF EXISTS on_admin_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_admin();
