import type { NextConfig } from "next";

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
  /* config options here */
};

export default nextConfig;