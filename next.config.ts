
import type {NextConfig} from 'next';

const repoName = 'Roll-Together'; // Your repository name

const nextConfig: NextConfig = {
  output: 'export', // Enable static HTML export
  basePath: `/${repoName}`,
  assetPrefix: `/${repoName}/`,
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
