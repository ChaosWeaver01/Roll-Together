
import type {NextConfig} from 'next';

const isGithubPages = process.env.NEXT_PUBLIC_GITHUB_PAGES === 'true';
const repoName = 'Roll-Together'; // Your repository name

const nextConfig: NextConfig = {
  output: 'export', // Enable static HTML export
  // Conditionally set basePath and assetPrefix for GitHub Pages
  basePath: isGithubPages ? `/${repoName}` : '',
  assetPrefix: isGithubPages ? `/${repoName}/` : '',
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
