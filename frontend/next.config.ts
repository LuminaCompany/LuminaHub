import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tree-shake heavy barrel packages so only the icons/helpers actually used
  // land in the bundle.
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "date-fns"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rssbcbcrtcwkkurnrehq.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
