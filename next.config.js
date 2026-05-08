/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  // Phase 3-C: Reduce bundle size by tree-shaking large icon/utility packages
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Allow profile images from Google and Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig
