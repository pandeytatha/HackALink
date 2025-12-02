/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    SCRAPERAI_BASE_URL: process.env.SCRAPERAI_BASE_URL,
  },
}

module.exports = nextConfig

