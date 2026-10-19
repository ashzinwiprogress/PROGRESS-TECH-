/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverRuntimeConfig: {
    blobToken: process.env.BLOB_READ_WRITE_TOKEN || ''
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb'
    },
    allowedHosts: ['.monkeycode-ai.live']
  }
};

module.exports = nextConfig;
