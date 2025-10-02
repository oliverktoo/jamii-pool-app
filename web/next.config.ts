import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a static site in /out
  output: "export",
  // If you ever add <Image/>, disable optimization for static export
  images: { unoptimized: true },
};

export default nextConfig;
