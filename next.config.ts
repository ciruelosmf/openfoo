// next.config.ts
import type { NextConfig } from "next";
 

const nextConfig: NextConfig = {
 
  async headers() {
    return [
      
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // Or 'DENY'
          },
 
          // {
          //   key: 'Content-Security-Policy',
          //   value: "frame-ancestors 'self';", // This is an alternative to X-Frame-Options
          // },
        ],
      },
    ];
  },
};

export default nextConfig;