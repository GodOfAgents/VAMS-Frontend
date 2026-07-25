import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const surface = env.VITE_VAMS_SURFACE || 'all'

  return {
    plugins: [react()],
    build: {
      target: 'esnext',
      minify: 'esbuild',
      outDir: surface === 'all' ? 'dist' : `dist/${surface}`,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/three')) return 'three-marketing'
            if (id.includes('node_modules/gsap')) return 'gsap-marketing'
            if (id.includes('node_modules/motion')) return 'motion-ui'
            if (id.includes('node_modules/react')) return 'react-vendor'
          },
        },
      },
      chunkSizeWarningLimit: 500,
    },
    optimizeDeps: {
      include: ['motion/react', 'react', 'react-dom', 'react-router-dom', 'zod'],
    },
    test: {
      environment: 'node',
      globals: true,
      include: ['src/**/*.{test,spec}.{js,jsx}'],
      fileParallelism: false,
      maxWorkers: 1,
      minWorkers: 1,
      testTimeout: 30000,
    },
  }
})
