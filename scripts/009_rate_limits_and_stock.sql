-- ============================================================================
-- 009 — Rate limiting and safe stock reservation
--
-- Run in the Supabase SQL editor BEFORE deploying the matching app code.
-- Idempotent: safe to run more than once. The app keeps working (without
-- rate limiting) if this has not been applied yet.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Fixed-window rate limiter.
--    Keys are opaque strings built by the server (e.g. "orders:<sha256 of IP>"),
--    so no raw IP addresses are stored.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key          text        NOT NULL,
  window_start timestamptz NOT NULL,
  hits         integer     NOT NULL DEFAULT 0,
  PRIMARY KEY (key, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies: only the service role (which bypasses RLS) may touch this table.
REVOKE ALL ON public.rate_limits FROM anon, authenticated;

CREATE INDEX IF NOT EXISTS rate_limits_window_idx ON public.rate_limits (window_start);

-- Returns TRUE when the call is allowed, FALSE when the limit is exceeded.
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window timestamptz;
  v_hits   integer;
BEGIN
  IF p_key IS NULL OR length(p_key) > 200 OR p_limit < 1 OR p_window_seconds < 1 THEN
    RAISE EXCEPTION 'invalid rate limit arguments';
  END IF;

  v_window := to_timestamp(floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds);

  INSERT INTO public.rate_limits AS r (key, window_start, hits)
  VALUES (p_key, v_window, 1)
  ON CONFLICT (key, window_start) DO UPDATE SET hits = r.hits + 1
  RETURNING hits INTO v_hits;

  -- Opportunistic cleanup of old windows (cheap thanks to the index).
  IF random() < 0.01 THEN
    DELETE FROM public.rate_limits WHERE window_start < now() - interval '1 day';
  END IF;

  RETURN v_hits <= p_limit;
END;
$$;
REVOKE ALL ON FUNCTION public.check_rate_limit(text, integer, integer) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) TO service_role;

-- ----------------------------------------------------------------------------
-- 2. Put stock back when an order could not be completed after reserving it.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.restore_stock(p_product_id uuid, p_quantity integer)
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
  SET stock = stock + p_quantity,
      updated_at = now()
  WHERE id = p_product_id
  RETURNING stock INTO new_stock;

  RETURN new_stock;
END;
$$;
REVOKE ALL ON FUNCTION public.restore_stock(uuid, integer) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.restore_stock(uuid, integer) TO service_role;

-- ----------------------------------------------------------------------------
-- 3. Categories are at most two levels deep and never their own parent.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_category_parent()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.parent_id = NEW.id THEN
    RAISE EXCEPTION 'a category cannot be its own parent' USING ERRCODE = '23514';
  END IF;
  IF EXISTS (SELECT 1 FROM public.categories WHERE id = NEW.parent_id AND parent_id IS NOT NULL) THEN
    RAISE EXCEPTION 'the parent must be a top-level category' USING ERRCODE = '23514';
  END IF;
  IF EXISTS (SELECT 1 FROM public.categories WHERE parent_id = NEW.id) THEN
    RAISE EXCEPTION 'a category with sub-categories cannot become a sub-category' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS categories_check_parent ON public.categories;
CREATE TRIGGER categories_check_parent
  BEFORE INSERT OR UPDATE OF parent_id ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.check_category_parent();

-- ----------------------------------------------------------------------------
-- 4. Category image is a hex colour or an http(s) URL.
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  ALTER TABLE public.categories
    ADD CONSTRAINT categories_image_format
    CHECK (image IS NULL OR image ~* '^#[0-9a-f]{6}$' OR image ~* '^https?://') NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;
