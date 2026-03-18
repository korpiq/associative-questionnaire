import { describe, expect, it } from 'vitest'

import { readTargetNameArgument } from '../src/cli/read-target-name-argument'

describe('readTargetNameArgument', () => {
  it('uses the provided target name when one is passed', () => {
    expect(readTargetNameArgument(['node', 'script', 'staging'], 'sample')).toBe('staging')
  })

  it('falls back to the default target name when none is passed', () => {
    expect(readTargetNameArgument(['node', 'script'], 'sample')).toBe('sample')
  })
})
