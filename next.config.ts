import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Enable static HTML export
  // If your site is hosted at a subpath, e.g., https://your-username.github.io/your-repo-name/
  // Uncomment and set the basePath and assetPrefix below.
  // basePath: '/your-repo-name',
  // assetPrefix: '/your-repo-name/', // Note the trailing slash for assetPrefix
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Required for static export as next/image optimization needs a server
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
