/**
 * Run once to create the initial admin user.
 * Usage:  node scripts/seedAdmin.js
 *
 * Set ADMIN_EMAIL and ADMIN_PASSWORD below (or via env vars) before running.
 * Change the password immediately after first login.
 */

import "dotenv/config.js";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_NAME     = process.env.SEED_ADMIN_NAME     || "Admin";
const ADMIN_EMAIL    = process.env.SEED_ADMIN_EMAIL    || "admin@shivaamfarms.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@1234";

async function seedAdmin() {
  console.log("Checking for existing admin user …");

  const { data: existing, error: fetchError } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", ADMIN_EMAIL.toLowerCase().trim())
    .limit(1);

  if (fetchError) {
    console.error("Error querying users table:", fetchError.message);
    console.error("Make sure you have created the `users` table first (see SQL migration).");
    process.exit(1);
  }

  if (existing && existing.length > 0) {
    console.log(`Admin already exists: ${existing[0].email}  (id: ${existing[0].id})`);
    console.log("Skipping seed — no changes made.");
    process.exit(0);
  }

  console.log("Creating admin user …");

  const password_hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const { data, error } = await supabase
    .from("users")
    .insert([{
      name:          ADMIN_NAME,
      email:         ADMIN_EMAIL.toLowerCase().trim(),
      password_hash,
      role:          "admin",
      is_active:     true,
    }])
    .select("id, name, email, role")
    .single();

  if (error) {
    console.error("Failed to create admin:", error.message);
    process.exit(1);
  }

  console.log("\n✅ Admin user created successfully!");
  console.log("─────────────────────────────────────");
  console.log(`  Name  : ${data.name}`);
  console.log(`  Email : ${data.email}`);
  console.log(`  Role  : ${data.role}`);
  console.log(`  ID    : ${data.id}`);
  console.log("─────────────────────────────────────");
  console.log(`  Password : ${ADMIN_PASSWORD}`);
  console.log("\n⚠️  Change the admin password after first login!\n");
  process.exit(0);
}

seedAdmin();
