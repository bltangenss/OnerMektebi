export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isCmsConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export const MEDIA_BUCKET = "media";
