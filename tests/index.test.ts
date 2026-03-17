import { describe, expect, it } from 'vitest'

import { parseSurvey } from '../src'

describe('project bootstrap', () => {
  it('loads TypeScript sources under Node 20 settings', () => {
    expect(typeof parseSurvey).toBe('function')
  })
})
