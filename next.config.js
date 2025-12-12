/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // 限定 Supabase 域名，更安全
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in', // Supabase 印度区域
      },
    ],
    formats: ['image/avif', 'image/webp'], // 优先使用现代格式
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // 响应式尺寸
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // 小图标尺寸
    minimumCacheTTL: 60, // 缓存 60 秒
    dangerouslyAllowSVG: true, // 允许 SVG（如果需要）
    contentDispositionType: 'attachment', // SVG 安全设置
  },
}

module.exports = nextConfig


