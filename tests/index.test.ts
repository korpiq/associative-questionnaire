import { describe, expect, it } from 'vitest'

import { createProjectMarker } from '../src/index.js'

describe('project bootstrap', () => {
  it('loads TypeScript sources under Node 20 settings', () => {
    expect(createProjectMarker()).toBe('associative-questionnaire')
  })
})
