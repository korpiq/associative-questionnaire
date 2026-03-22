import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/tooling/specs/**/*.spec.ts']
  }
})
