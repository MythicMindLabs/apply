import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'EchoPay-2 Voice Payments',
        short_name: 'EchoPay-2',
        description: 'Voice-activated payments for Polkadot ecosystem',
        theme_color: '#2B6CB0',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/services': resolve(__dirname, './src/services'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/types': resolve(__dirname, './src/types'),
      '@/assets': resolve(__dirname, './src/assets')
    }
  },

  // Development server configuration
  server: {
    port: 3000,
    host: true,
    open: true,    
    cors: true,
    hmr: {
      overlay: true
    }
  },

  // Build configuration  
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    target: 'es2020',
    
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'polkadot-vendor': [
            '@polkadot/api',
            '@polkadot/extension-dapp',
            '@polkadot/types',
            '@polkadot/util',
            '@polkadot/util-crypto',
            '@polkadot/keyring'
          ],
          'ui-vendor': [
            '@chakra-ui/react',
            '@emotion/react',
            '@emotion/styled',
            'framer-motion'
          ],
          'crypto-vendor': ['crypto-js'],
          
          // App chunks
          'voice-services': [
            './src/services/VoiceService.ts',
            './src/services/ElevenLabsService.ts',
            './src/services/CommandParsingService.ts'
          ],
          'polkadot-services': [
            './src/services/PolkadotService.ts',
            './src/services/SecurityService.ts'
          ]
        }
      }
    },
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Terser options for production
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },

  // Preview server for production build
  preview: {
    port: 3000,
    host: true,
    open: true
  },

  // Define global constants
  define: {
    global: 'globalThis',
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },

  // CSS configuration
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase'
    }
  },

  // Optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@polkadot/api',
      '@polkadot/extension-dapp',
      '@chakra-ui/react',
      'framer-motion'
    ],
    exclude: [
      // Exclude problematic packages if needed
    ]
  },

  // Environment variables
  envPrefix: 'VITE_',

  // Test configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  }
})
