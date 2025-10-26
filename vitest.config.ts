import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import { resolve as sharedResolve } from './vite.config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: sharedResolve,
})
