import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/types': path.resolve(__dirname, './src/types')
    }
  },
  define: {
    global: 'globalThis'
  },
  server: {
    port: 5173,
    host: true,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          polkadot: ['@polkadot/api', '@polkadot/extension-dapp', '@polkadot/api-contract'],
          react: ['react', 'react-dom'],
          utils: ['@polkadot/util', '@polkadot/util-crypto']
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      '@polkadot/api',
      '@polkadot/extension-dapp',
      '@polkadot/api-contract',
      '@polkadot/util',
      '@polkadot/util-crypto'
    ]
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts']
  }
})