import type { NextConfig } from "next";

console.log(
  `process.env.NODE_ENV == "development" ? '' : process.env.NEXT_PUBLIC_BASE_PATH || '/market'`,
  process.env.NODE_ENV == "development" ? '' : process.env.NEXT_PUBLIC_BASE_PATH || '/market'
);

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/404",
        destination: "/error/404",
        permanent: false,
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  basePath: process.env.NODE_ENV == "development" ? '' : process.env.NEXT_PUBLIC_BASE_PATH ?? '/market',
  assetPrefix: process.env.NODE_ENV == "development" ? '' : process.env.NEXT_PUBLIC_BASE_PATH ?? '/market',
  trailingSlash: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;

//production hostname - hostname: "pub-a5aee6f14995472dbf4fdc3013cf95e4.r2.dev",
//development hostname - hostname: "pub-79ee03a4a23e4dbbb70c7d799d3cb786.r2.dev",
