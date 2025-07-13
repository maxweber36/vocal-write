/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  skipTrailingSlashRedirect: true,

  images: {
    unoptimized: true,
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    }
    return config
  },
}

module.exports = nextConfig
