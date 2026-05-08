/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
  // Skip the auto-export attempt of /404 and /500 that conflicts with App Router
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
};
module.exports = nextConfig;
