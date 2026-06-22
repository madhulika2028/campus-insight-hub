import { createClient } from "@supabase/supabase-js";

// External Supabase project that hosts the companies dataset (116 companies).
// The publishable/anon key is safe to ship in client code.
const SUPABASE_URL = "https://sslffsyjfkqqzlxbvrxs.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_IQxbrmz9HZ2lmtlM2k98ZQ_DT1JHuyr";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});
