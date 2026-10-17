import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // The approved site uses Unsplash placeholders for service / project imagery.
    // Replace these with SPS photography in /public/assets when it is available.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
