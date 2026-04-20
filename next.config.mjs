/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["*.serveousercontent.com", "*.loca.lt", "*.trycloudflare.com"],
  distDir: process.env.NEXT_DIST_DIR || ".next",
}

export default nextConfig
