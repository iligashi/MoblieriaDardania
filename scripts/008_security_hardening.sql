-- ============================================================================
-- 008 — Security hardening
--
-- Run this in the Supabase SQL editor BEFORE deploying the matching app code.
-- Every statement is idempotent: running the file twice is safe.
--
-- After running it, follow STEP 9 (manual) to remove accounts that were made
-- admins by the old signup trigger.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Stop turning every new sign-up into an admin.
--    Script 002 inserted EVERY new auth user into admin_users.
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_admin_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_admin();

-- admin_users is managed only with the service role (scripts/create-admin-user.ts).
DROP POLICY IF EXISTS "Admin users can view own data" ON public.admin_users;
CREATE POLICY "Admin users can view own data" ON public.admin_users
  FOR SELECT USING (auth.uid() = id);
REVOKE INSERT, UPDATE, DELETE ON public.admin_users FROM anon, authenticated;

-- Helper used by the policies below.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid());
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 2. Customer profile trigger: pinned search_path (SECURITY DEFINER best practice).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_customer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE id = NEW.id) THEN
    INSERT INTO public.customers (id, email, first_name, last_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_customer ON auth.users;
CREATE TRIGGER on_auth_user_created_customer
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_customer();

-- ----------------------------------------------------------------------------
-- 3. Row Level Security fixes
-- ----------------------------------------------------------------------------

-- customers: a user may only create THEIR OWN profile row.
DROP POLICY IF EXISTS "Public can create customer" ON public.customers;
DROP POLICY IF EXISTS "Customers can create own profile" ON public.customers;
CREATE POLICY "Customers can create own profile" ON public.customers
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Customers can update own data" ON public.customers;
CREATE POLICY "Customers can update own data" ON public.customers
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- cart_items: guest carts (customer_id IS NULL) were readable and writable by
-- everyone. Guest carts are now handled only by the server (service role).
DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart_items;
CREATE POLICY "Users can manage own cart" ON public.cart_items
  FOR ALL USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

-- wishlist_items: add WITH CHECK so rows cannot be written for someone else.
DROP POLICY IF EXISTS "Customers can manage own wishlist" ON public.wishlist_items;
CREATE POLICY "Customers can manage own wishlist" ON public.wishlist_items
  FOR ALL USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

-- addresses: same.
DROP POLICY IF EXISTS "Customers can manage own addresses" ON public.addresses;
CREATE POLICY "Customers can manage own addresses" ON public.addresses
  FOR ALL USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

-- orders / order_items: created only by the checkout API (service role), which
-- prices orders server-side. Direct inserts with the public anon key are closed.
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can insert order items" ON public.order_items;

DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE USING (public.is_admin());

-- settings (colour / material lists) are public catalogue data used by the shop filters.
DROP POLICY IF EXISTS "Public can view settings" ON public.settings;
CREATE POLICY "Public can view settings" ON public.settings
  FOR SELECT USING (true);

-- products: admins must also see inactive (hidden) products.
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. Deleting a product must never delete orders.
--    orders.furniture_id referenced products with ON DELETE CASCADE.
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  fk_name text;
BEGIN
  SELECT tc.constraint_name INTO fk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
  WHERE tc.table_schema = 'public'
    AND tc.table_name = 'orders'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'furniture_id'
  LIMIT 1;

  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT %I', fk_name);
  END IF;

  ALTER TABLE public.orders
    ADD CONSTRAINT orders_furniture_id_fkey
    FOREIGN KEY (furniture_id) REFERENCES public.products(id) ON DELETE SET NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 5. Unique, race-free order numbers.
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq;

DO $$
DECLARE
  current_count bigint;
BEGIN
  SELECT COUNT(*) INTO current_count FROM public.orders;
  -- Only move the sequence forward, never backwards.
  IF current_count > 0 AND (SELECT last_value FROM public.order_number_seq) < current_count THEN
    PERFORM setval('public.order_number_seq', current_count);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.next_order_number()
RETURNS text
LANGUAGE sql
VOLATILE
SET search_path = public
AS $$
  SELECT 'ORD-' || to_char(now() AT TIME ZONE 'Europe/Belgrade', 'YYYYMMDD') || '-'
         || lpad(nextval('public.order_number_seq')::text, 4, '0');
$$;
REVOKE ALL ON FUNCTION public.next_order_number() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_order_number() TO service_role;

-- The old "count + 1" generator produced duplicates. De-duplicate, then enforce uniqueness.
WITH dupes AS (
  SELECT id, order_number,
         row_number() OVER (PARTITION BY order_number ORDER BY created_at, id) AS rn
  FROM public.orders
  WHERE order_number IS NOT NULL
)
UPDATE public.orders o
SET order_number = d.order_number || '-' || d.rn
FROM dupes d
WHERE o.id = d.id AND d.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_key
  ON public.orders (order_number) WHERE order_number IS NOT NULL;

DROP FUNCTION IF EXISTS public.generate_order_number();

-- ----------------------------------------------------------------------------
-- 6. Atomic stock decrement (cannot go below zero, no lost updates).
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.decrement_stock(uuid, integer);
CREATE FUNCTION public.decrement_stock(p_product_id uuid, p_quantity integer)
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_stock integer;
BEGIN
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'quantity must be positive';
  END IF;

  UPDATE public.products
  SET stock = stock - p_quantity,
      updated_at = now()
  WHERE id = p_product_id AND stock >= p_quantity
  RETURNING stock INTO new_stock;

  IF new_stock IS NULL THEN
    RAISE EXCEPTION 'insufficient stock for product %', p_product_id USING ERRCODE = 'P0001';
  END IF;

  RETURN new_stock;
END;
$$;
REVOKE ALL ON FUNCTION public.decrement_stock(uuid, integer) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_stock(uuid, integer) TO service_role;

-- ----------------------------------------------------------------------------
-- 7. Data integrity guards.
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  ALTER TABLE public.products ADD CONSTRAINT products_stock_non_negative CHECK (stock >= 0) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.products ADD CONSTRAINT products_price_non_negative CHECK (price >= 0) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Product URLs are /products/<slug>; duplicate slugs made one product unreachable.
WITH dupes AS (
  SELECT id, slug, row_number() OVER (PARTITION BY slug ORDER BY created_at, id) AS rn
  FROM public.products
  WHERE slug IS NOT NULL
)
UPDATE public.products p
SET slug = d.slug || '-' || d.rn
FROM dupes d
WHERE p.id = d.id AND d.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_key ON public.products (slug) WHERE slug IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 8. Give every non-admin account a customer profile (accounts created while
--    the old trigger was active never got one). Safe to run repeatedly.
-- ----------------------------------------------------------------------------
INSERT INTO public.customers (id, email, first_name, last_name)
SELECT u.id,
       u.email,
       COALESCE(u.raw_user_meta_data->>'first_name', ''),
       COALESCE(u.raw_user_meta_data->>'last_name', '')
FROM auth.users u
WHERE u.email IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.admin_users a WHERE a.id = u.id)
  AND NOT EXISTS (SELECT 1 FROM public.customers c WHERE c.id = u.id)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ============================================================================
-- STEP 9 — MANUAL: remove admins created by the old trigger.
--
-- 1) Review who is currently an admin:
--
--      SELECT a.email, a.created_at FROM public.admin_users a ORDER BY a.created_at;
--
-- 2) Keep ONLY the real staff accounts. Put their emails in the list and run:
--
--      DELETE FROM public.admin_users
--      WHERE lower(email) NOT IN ('owner@example.com');   -- <-- edit this list
--
-- 3) Re-run section 8 above so the removed accounts get a customer profile.
--
-- 4) Rotate the admin password that was committed to the repository
--    (Supabase → Authentication → Users → … → Reset password), and
--    rotate SUPABASE_SERVICE_ROLE_KEY if it was ever shared.
-- ============================================================================
