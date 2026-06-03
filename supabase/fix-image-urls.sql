-- Run after migrating to a NEW Supabase project.
-- Replaces old project host in image_url with your current project.
-- Change OLD_REF and NEW_REF below, then run in SQL Editor.

-- Example:
-- OLD: xmaawnzzlnpbtfxzsduj
-- NEW: twybuesrupusogzoszqf  (from your VITE_SUPABASE_URL)

update public.products
set image_url = replace(
  image_url,
  'https://xmaawnzzlnpbtfxzsduj.supabase.co',
  'https://twybuesrupusogzoszqf.supabase.co'
)
where image_url like '%xmaawnzzlnpbtfxzsduj.supabase.co%';

-- You must upload the same files to Storage → products on the NEW project,
-- OR images will 404 until files exist at the new URLs.
