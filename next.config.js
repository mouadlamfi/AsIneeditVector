/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  distDir: 'out',
  
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Asset optimization
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  // Performance optimizations
  experimental: {
    // optimizeCss: true, // Removed due to critters dependency issue
  },
  
  // Webpack optimizations for mobile
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size for mobile
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // Mobile-specific chunk optimization
          mobile: {
            test: /[\\/]src[\\/]components[\\/](canvas|grid|flower)/,
            name: 'mobile-canvas',
            chunks: 'all',
            priority: 5,
          },
          // UI components chunk
          ui: {
            test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
            name: 'ui-components',
            chunks: 'all',
            priority: 3,
          },
        },
      };
      
      // Mobile-first code splitting
      config.optimization.runtimeChunk = 'single';
      
      // Reduce bundle size for mobile
      config.optimization.minimize = true;
    }
    
    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    
    // Mobile-first module resolution
    config.resolve.modules = [
      'node_modules',
      'src',
    ];
    
    // Mobile-first performance optimizations
    if (!dev) {
      // Remove source maps for production
      config.devtool = false;
    }
    
    return config;
  },
  
  // Mobile-first environment variables
  env: {
    MOBILE_OPTIMIZED: process.env.NODE_ENV === 'production' ? 'true' : 'false',
    PERFORMANCE_MODE: process.env.NODE_ENV === 'production' ? 'mobile-first' : 'development',
  },
};

module.exports = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({ enabled: true })(nextConfig)
  : nextConfig;