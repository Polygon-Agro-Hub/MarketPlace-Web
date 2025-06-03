import type { NextConfig } from "next";
console.log(  `process.env.NODE_ENV == "development" ? '' : process.env.NEXT_PUBLIC_BASE_PATH || '/market'`, process.env.NODE_ENV == "development" ? '' : process.env.NEXT_PUBLIC_BASE_PATH || '/market')
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/404',
        destination: '/error/404',
        permanent: false,
      },
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  basePath: process.env.NODE_ENV == "development" ? '' : process.env.NEXT_PUBLIC_BASE_PATH ?? '/market',
  assetPrefix: process.env.NODE_ENV == "development" ? '' : process.env.NEXT_PUBLIC_BASE_PATH ??  '/market/',

  /* other config options here */
};

export default nextConfig;
