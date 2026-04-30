const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@insforge/sdk', 'sharp', 'jsonwebtoken', 'bcryptjs']
  },
  images: {
    remotePatterns: [
      { hostname: '*.vercel-storage.com' },
      { hostname: '*.r2.dev' },
      { hostname: 'roshanalinfotech.com' },
      { hostname: '8cftq4jt.us-east.insforge.app' }
    ]
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ]
      }
    ]
  }
};

module.exports = nextConfig;
