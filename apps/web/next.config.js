/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['192.168.1.5', '192.168.1.4', '192.168.1.15'],
}

module.exports = nextConfig
