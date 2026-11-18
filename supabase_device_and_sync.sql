-- ============================================================================
-- Hindi Bhajan Manjari — Device Limit, Cloud Saved Bhajans & Play Billing SQL
-- Safe to run multiple times (idempotent) in Supabase Dashboard -> SQL Editor.
-- ============================================================================

-- 1. LINKED DEVICE SESSIONS (Enforces max 2 active devices per account)
CREATE TABLE IF NOT EXISTS public.app_device_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_name TEXT,
  platform TEXT DEFAULT 'android',
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_app_device_sessions_user
  ON public.app_device_sessions (user_id, last_seen_at DESC);

ALTER TABLE public.app_device_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own linked devices" ON public.app_device_sessions;
CREATE POLICY "Users can view own linked devices"
  ON public.app_device_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own linked devices" ON public.app_device_sessions;
CREATE POLICY "Users can delete own linked devices"
  ON public.app_device_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

GRANT ALL ON public.app_device_sessions TO service_role;
GRANT SELECT, DELETE ON public.app_device_sessions TO authenticated;

-- 2. CLOUD-SYNCED SAVED BHAJANS (संग्रह backup across reinstalls & devices)
CREATE TABLE IF NOT EXISTS public.app_user_saved_bhajans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bhajan_slug TEXT NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, bhajan_slug)
);

CREATE INDEX IF NOT EXISTS idx_app_user_saved_bhajans_user
  ON public.app_user_saved_bhajans (user_id, saved_at DESC);

ALTER TABLE public.app_user_saved_bhajans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own saved bhajans" ON public.app_user_saved_bhajans;
CREATE POLICY "Users manage own saved bhajans"
  ON public.app_user_saved_bhajans
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON public.app_user_saved_bhajans TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_user_saved_bhajans TO authenticated;

-- 3. GOOGLE PLAY BILLING (India UCB) COLUMNS ON app_subscriptions
ALTER TABLE public.app_subscriptions
  ADD COLUMN IF NOT EXISTS billing_provider TEXT NOT NULL DEFAULT 'razorpay',
  ADD COLUMN IF NOT EXISTS play_purchase_token TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_app_subscriptions_play_token
  ON public.app_subscriptions (play_purchase_token)
  WHERE play_purchase_token IS NOT NULL;
