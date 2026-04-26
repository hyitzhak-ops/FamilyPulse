#!/usr/bin/env node
/**
 * Quick check that publishable Supabase env is visible (same resolution as next.config).
 * Run: node scripts/check-supabase-env.cjs
 */
const { loadEnvConfig } = require("@next/env");
const path = require("node:path");

const root = path.join(__dirname, "..");
const { combinedEnv } = loadEnvConfig(
  root,
  process.env.NODE_ENV !== "production",
);
const url = combinedEnv.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = combinedEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.\n" +
      "Create .env.local in the project root (next to package.json) with both variables.",
  );
  process.exit(1);
}

console.log("OK: Supabase publishable env is loaded from .env files.");
console.log("URL prefix:", url.slice(0, 28) + "…");
console.log("Anon key length:", key.length);
