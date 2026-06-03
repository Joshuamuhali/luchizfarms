/**
 * Normalizes Supabase Storage URLs to the current project (from VITE_SUPABASE_URL).
 * Fixes DB rows that still point at an old project host after migration.
 */
export function normalizeSupabaseStorageUrl(
  url: string | null | undefined
): string | undefined {
  if (!url) return undefined;

  let normalized = url.replace("/sign/", "/object/public/").split("?")[0];

  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) return normalized;

  try {
    const currentHost = new URL(base).host;
    normalized = normalized.replace(
      /https?:\/\/[a-z0-9]+\.supabase\.co/i,
      `https://${currentHost}`
    );
  } catch {
    // keep normalized as-is
  }

  return normalized;
}

/** Build a public Storage URL for the current project */
export function storagePublicUrl(bucket: string, path: string): string {
  const base = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "") ?? "";
  const cleanPath = path.replace(/^\//, "");
  return `${base}/storage/v1/object/public/${bucket}/${cleanPath}`;
}
