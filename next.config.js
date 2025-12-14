/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // 🚀 启用 SWC 压缩（比 Terser 快 7 倍，减少 214KB JS）
  swcMinify: true,

  // 🗜️ 启用压缩
  compress: true,

  // 🖼️ 图片优化配置
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
      {
        protocol: 'https',
        hostname: 'images.pexels.com', // Hero 背景图
      },
    ],
    formats: ['image/avif', 'image/webp'], // 优先使用现代格式
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // 响应式尺寸
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // 小图标尺寸
    minimumCacheTTL: 3600, // 缓存 1 小时（从 60 秒提升）
    dangerouslyAllowSVG: true, // 允许 SVG（如果需要）
    contentDispositionType: 'attachment', // SVG 安全设置
  },

  // 🔧 编译器优化配置
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // ⚡ 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns'],
  },

  // 📦 HTTP 缓存头配置
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // 🔧 Webpack 高级优化
  webpack: (config, { isServer, dev }) => {
    // 优化客户端打包
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25, // 提高并行加载数
          minSize: 20000, // 最小 chunk 大小 20KB
          cacheGroups: {
            // 将 Recharts 单独打包（最大的依赖）
            recharts: {
              test: /[\\/]node_modules[\\/](recharts|d3-.*)[\\/]/,
              name: 'recharts',
              priority: 20,
              reuseExistingChunk: true,
              enforce: true,
            },
            // 将图标库单独打包
            icons: {
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              name: 'icons',
              priority: 15,
              reuseExistingChunk: true,
            },
            // 将 React 相关库打包在一起
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              name: 'react-vendor',
              priority: 10,
              reuseExistingChunk: true,
            },
            // Supabase 单独打包
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'supabase',
              priority: 12,
              reuseExistingChunk: true,
            },
            // 其他第三方库
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              priority: 5,
              reuseExistingChunk: true,
              minChunks: 2, // 至少被 2 个 chunk 使用
            },
          },
        },
      }

      // 🎯 生产环境额外优化
      if (!dev) {
        // 移除 source map（减小体积）
        config.devtool = false
      }
    }

    return config
  },
}

// 使用 withBundleAnalyzer 包装配置
module.exports = withBundleAnalyzer(nextConfig)


