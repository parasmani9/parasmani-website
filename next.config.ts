import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseHostname: string | undefined;

if (supabaseUrl) {
  try {
    supabaseHostname = new URL(supabaseUrl).hostname;
  } catch {
    // ignore
  }
}

const remotePatterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [
  {
    protocol: "https",
    hostname: "images.unsplash.com",
  },
  {
    protocol: "https",
    hostname: "*.supabase.co",
  },
];

if (supabaseHostname && !supabaseHostname.endsWith(".supabase.co")) {
  remotePatterns.push({
    protocol: supabaseUrl?.startsWith("http://") ? "http" : "https",
    hostname: supabaseHostname,
  });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;

