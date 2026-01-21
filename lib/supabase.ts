import { createClient } from "@supabase/supabase-js";

// Read environment variables safely. Don't use `!` — allow undefined so the
// module won't throw on import (middleware/edge environments may not expose
// server secrets). We intentionally avoid constructing clients unless the
// required env values exist.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase: any =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : undefined;

export const supabaseAdmin: any =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : undefined;

// Helpful runtime guard for debugging: export helper getters if needed.
export function ensureSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is missing — cannot construct supabaseAdmin",
    );
  }
  return supabaseAdmin;
}
