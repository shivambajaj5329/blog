import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['ljpeuvrslzjohldwfhsb.supabase.co'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
