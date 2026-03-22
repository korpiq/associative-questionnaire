import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      'tests/feature/specs/**/*.spec.ts',
      'tests/integration/specs/**/*.spec.ts',
      'tests/**/*.test.ts'
    ]
  }
})
