import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Enable gzip compression
  compress: true,
  // Enable static optimization
  reactStrictMode: true,
  // Optimize bundle size
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize Three.js imports
      config.resolve.alias = {
        ...config.resolve.alias,
        'three': 'three',
      };
    }
    return config;
  },
  // Performance optimizations
  poweredByHeader: false,
  generateEtags: false,
};

// Conditionally apply bundle analyzer only when ANALYZE is true
export default process.env.ANALYZE === 'true' 
  ? require('@next/bundle-analyzer')({ enabled: true })(nextConfig)
  : nextConfig;
