import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Server-only client (never import this from a page/component that runs in
// the browser). Uses the service role key so API routes can read/write the
// bookings table regardless of RLS policies — safe because it only runs on
// the server, inside pages/api/*.
export const supabaseAdmin =
  supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;
