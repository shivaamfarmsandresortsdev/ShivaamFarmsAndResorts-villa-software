import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

console.log("🔍 Loading Supabase config...");
console.log("👉 SUPABASE_URL:", process.env.SUPABASE_URL ? "Loaded" : "NOT LOADED");
console.log("👉 SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Loaded" : "NOT LOADED");

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);