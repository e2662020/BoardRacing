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
})
