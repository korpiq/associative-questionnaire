import { describe, expect, it } from 'vitest'

import { parseQuestionnaire } from '../src'

describe('project bootstrap', () => {
  it('loads TypeScript sources under Node 20 settings', () => {
    expect(typeof parseQuestionnaire).toBe('function')
  })
})
