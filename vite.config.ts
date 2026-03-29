import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/luckysheet/dist/plugins/css/pluginsCss.css',
          dest: 'luckysheet/plugins/css',
          rename: 'pluginsCss.css'
        },
        {
          src: 'node_modules/luckysheet/dist/plugins/plugins.css',
          dest: 'luckysheet/plugins',
          rename: 'plugins.css'
        },
        {
          src: 'node_modules/luckysheet/dist/css/luckysheet.css',
          dest: 'luckysheet/css',
          rename: 'luckysheet.css'
        },
        {
          src: 'node_modules/luckysheet/dist/assets/iconfont/iconfont.css',
          dest: 'luckysheet/assets/iconfont',
          rename: 'iconfont.css'
        },
        {
          src: 'node_modules/luckysheet/dist/assets/iconfont/iconfont.*',
          dest: 'luckysheet/assets/iconfont'
        },
        {
          src: 'node_modules/luckysheet/dist/plugins/js/plugin.js',
          dest: 'luckysheet/plugins/js',
          rename: 'plugin.js'
        },
        {
          src: 'node_modules/luckysheet/dist/luckysheet.umd.js',
          dest: 'luckysheet',
          rename: 'luckysheet.umd.js'
        },
        {
          src: 'node_modules/luckysheet/dist/css/*.png',
          dest: 'luckysheet/css'
        },
        {
          src: 'node_modules/luckysheet/dist/css/*.svg',
          dest: 'luckysheet/css'
        },
        {
          src: 'node_modules/luckysheet/dist/css/*.gif',
          dest: 'luckysheet/css'
        },
        {
          src: 'node_modules/luckysheet/dist/css/*.ico',
          dest: 'luckysheet/css'
        },
        {
          src: 'node_modules/luckysheet/dist/plugins/images/*',
          dest: 'luckysheet/plugins/images'
        },
        {
          src: 'node_modules/luckysheet/dist/fonts/*',
          dest: 'luckysheet/fonts'
        }
      ]
    })
  ],
  build: {
    // 代码分割配置
    rollupOptions: {
      output: {
        // 手动代码分割
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor'
            }
            if (id.includes('antd') || id.includes('@ant-design')) {
              return 'antd-vendor'
            }
            if (id.includes('zustand')) {
              return 'state-vendor'
            }
            if (id.includes('recharts')) {
              return 'chart-vendor'
            }
            if (id.includes('@tanstack/react-table')) {
              return 'table-vendor'
            }
            return 'vendor'
          }
        },
        // 控制 chunk 大小
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || ''
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(name)) {
            return 'assets/images/[name]-[hash][extname]'
          }
          if (/\.css$/i.test(name)) {
            return 'assets/css/[name]-[hash][extname]'
          }
          return 'assets/[ext]/[name]-[hash][extname]'
        },
      },
    },
    // 压缩配置 - 使用esbuild默认压缩
    minify: 'esbuild',
    // 增加 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      '@ant-design/icons',
      'zustand',
      'axios',
      'dayjs',
    ],
  },
})
