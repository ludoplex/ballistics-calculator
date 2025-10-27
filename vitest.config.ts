import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import viteConfig from './vite.config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: viteConfig.resolve,
})
