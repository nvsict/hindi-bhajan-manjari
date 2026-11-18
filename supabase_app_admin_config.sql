-- ============================================================================
-- Hindi Bhajan Manjari — Admin App Manager Dynamic Release & Festival Config
-- Safe to run multiple times (idempotent) in Supabase Dashboard -> SQL Editor.
-- Enables live editing of APK download URL, SHA-256, version, changelog &
-- festival overrides directly from https://www.hindibhajanmanjari.com/admin/app-manager
-- ============================================================================

-- 1. LIVE ANDROID APK RELEASE CONFIG (Single row id = 'android_main')
CREATE TABLE IF NOT EXISTS public.app_release_config (
  id TEXT PRIMARY KEY DEFAULT 'android_main',
  latest_version TEXT NOT NULL DEFAULT '1.0.0',
  version_code INTEGER NOT NULL DEFAULT 2,
  release_channel TEXT NOT NULL DEFAULT 'stable' CHECK (release_channel IN ('stable', 'beta')),
  release_date TEXT NOT NULL DEFAULT 'November 2026',
  release_date_hi TEXT NOT NULL DEFAULT 'नवंबर 2026',
  apk_size_label TEXT NOT NULL DEFAULT '28 MB',
  min_android TEXT NOT NULL DEFAULT 'Android 8.0 (Oreo) or higher',
  min_sdk INTEGER NOT NULL DEFAULT 26,
  architecture TEXT NOT NULL DEFAULT 'Universal (arm64-v8a, armeabi-v7a)',
  apk_download_url TEXT NOT NULL DEFAULT '',
  sha256 TEXT NOT NULL DEFAULT '',
  is_mandatory_update BOOLEAN NOT NULL DEFAULT false,
  changelog JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.app_release_config (id)
VALUES ('android_main')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.app_release_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read app_release_config" ON public.app_release_config;
CREATE POLICY "Public read app_release_config"
  ON public.app_release_config FOR SELECT
  USING (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.app_release_config TO anon, authenticated;
GRANT ALL ON public.app_release_config TO service_role;

-- 2. REMOTE FESTIVAL DATE OVERRIDES (idempotent, if not already created)
CREATE TABLE IF NOT EXISTS public.app_festivals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  festival_id TEXT NOT NULL CHECK (
    festival_id IN (
      'janmashtami',
      'navratri',
      'diwali',
      'shivratri',
      'ram_navami',
      'hanuman_jayanti',
      'holi',
      'ganesh_chaturthi',
      'vasant_panchami',
      'ekadashi'
    )
  ),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  custom_title_hi TEXT,
  custom_tagline_hi TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_festivals_dates
  ON public.app_festivals (is_active, start_date, end_date);

ALTER TABLE public.app_festivals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active festivals" ON public.app_festivals;
CREATE POLICY "Public read active festivals"
  ON public.app_festivals FOR SELECT
  USING (is_active = true);

GRANT SELECT ON public.app_festivals TO anon, authenticated;
GRANT ALL ON public.app_festivals TO service_role;
