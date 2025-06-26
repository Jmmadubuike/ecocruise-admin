// next.config.ts
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint errors
  },
  typescript: {
    ignoreBuildErrors: true, // Skip TypeScript errors
  },
};

export default nextConfig;