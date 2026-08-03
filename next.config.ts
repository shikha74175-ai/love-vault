import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lsrnpfmwhrafmmmeywge.supabase.co",
      },
    ],
  },
};

export default nextConfig;