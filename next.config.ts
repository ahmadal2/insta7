import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations for mobile
  images: {
    formats: ['image/webp'],
    deviceSizes: [320, 420, 640, 750, 828, 1080],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Compression for better loading
  compress: true,
  
  // Enable experimental features for performance
  experimental: {
    // Enable optimizeCss for smaller bundles
    optimizeCss: true,
    // Reduce bundle size
    optimizePackageImports: ['lucide-react'],
    // Enable React Server Components for better performance
    reactCompiler: true,
  },
  
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Reduce bundle size by excluding unnecessary locales
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    // Optimize for mobile by reducing chunk sizes
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          maxSize: 244000, // Reduce max chunk size for mobile
        },
      };
    }
    
    return config;
  },
  
  // Headers for better caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300',
          },
        ],
      },
      {
        // Add service worker header
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
        ],
      },
    ]
  },
  
  // Reduce page size for mobile
  reactStrictMode: false, // Disable in production for slightly better performance
};

export default nextConfig;