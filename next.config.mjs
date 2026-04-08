/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["*.serveousercontent.com", "*.loca.lt", "*.trycloudflare.com"],
}

export default nextConfig
