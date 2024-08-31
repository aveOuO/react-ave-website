import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 模块解析
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
