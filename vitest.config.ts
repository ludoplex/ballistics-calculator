import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.spec.ts'],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@/lib': './src/lib',
      '@': './src',
    },
  },
})
