/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Phase 3-C: Reduce bundle size by tree-shaking large icon/utility packages
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig
