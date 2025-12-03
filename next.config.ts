import type { NextConfig } from 'next';
import path from 'path';

// Explicitly set the bundler to webpack
process.env.TURBOPACK = '0';
process.env.EXPERIMENTAL_TURBOPACK = '0';

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Disable i18n in next.config.ts as it's not supported in App Router
  // i18n is now handled through the new App Router i18n routing
  // https://nextjs.org/docs/app/building-your-application/routing/internationalization
  
  // Configure webpack to handle the @ alias
  webpack: (config) => {
    // Add the @ alias for absolute imports
    if (config.resolve && config.resolve.alias) {
      config.resolve.alias['@'] = path.join(__dirname, 'src');
    }
    
    // Important: Return the modified config
    return config;
  },
  
  // TypeScript configuration
  typescript: {
    // We'll let TypeScript check our code during build
    ignoreBuildErrors: false,
  },
  
  // Configure experimental features
  experimental: {
    // Enable server actions with proper configuration
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

// For ESLint configuration, use a separate .eslintrc.js file
// This is the recommended approach in Next.js
type ESLintConfig = {
  ignoreDuringBuilds: boolean;
};

// This is just for type safety, actual config is in .eslintrc.js
const eslintConfig: ESLintConfig = {
  ignoreDuringBuilds: false,
};

export default nextConfig;
