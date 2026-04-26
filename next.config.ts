import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// Load .env* into combinedEnv (and process.env) before reading values.
const { combinedEnv } = loadEnvConfig(
  process.cwd(),
  process.env.NODE_ENV !== "production",
);

const supabaseUrl =
  combinedEnv.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "";
const supabaseAnonKey =
  combinedEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
  },

  // Inlines publishable Supabase env into middleware & client bundles (Edge-safe).
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.NEXT_PUBLIC_SUPABASE_URL": JSON.stringify(supabaseUrl),
        "process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY":
          JSON.stringify(supabaseAnonKey),
      }),
    );
    return config;
  },
};

export default nextConfig;
