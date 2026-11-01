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
  async redirects() {
    return [
      {
        source: "/admin/dashboard",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/admin/dashboard/:path*",
        destination: "/dashboard/:path*",
        permanent: false,
      },
      {
        source: "/admin/products/new",
        destination: "/dashboard/inventory/new",
        permanent: false,
      },
      {
        source: "/admin/inventory/:path*",
        destination: "/dashboard/inventory/:path*",
        permanent: false,
      },
      {
        source: "/admin/events/:path*",
        destination: "/dashboard/events/:path*",
        permanent: false,
      },
      {
        source: "/admin",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

