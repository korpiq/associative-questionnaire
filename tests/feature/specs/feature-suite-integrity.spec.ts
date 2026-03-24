import { readFileSync, readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'

const feature = await loadFeature('tests/feature/feature-suite-integrity.feature')

describeFeature(feature, ({ Scenario }) => {
  let trackedFeatureFiles: string[] = []
  let loadedFeatureFiles = new Set<string>()

  function listTrackedFeatureFiles(): string[] {
    const result = spawnSync('git', ['ls-files', 'tests/feature'], {
      cwd: process.cwd(),
      encoding: 'utf8'
    })
    const deletedResult = spawnSync('git', ['ls-files', '--deleted', 'tests/feature'], {
      cwd: process.cwd(),
      encoding: 'utf8'
    })

    if (result.status !== 0 || deletedResult.status !== 0) {
      throw new Error(`git ls-files failed: ${result.stderr}`)
    }

    const deletedFiles = new Set(
      deletedResult.stdout
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    )

    return result.stdout
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.endsWith('.feature'))
      .filter((line) => !deletedFiles.has(line))
      .sort()
  }

  function listLoadedFeatureFiles(): Set<string> {
    return new Set(
      readdirSync(join(process.cwd(), 'tests', 'feature', 'specs'))
        .filter((entry) => entry.endsWith('.spec.ts'))
        .flatMap((entry) => {
          const contents = readFileSync(join(process.cwd(), 'tests', 'feature', 'specs', entry), 'utf8')
          return [...contents.matchAll(/loadFeature\('([^']+\.feature)'\)/g)]
            .map((match) => match[1])
            .filter((match): match is string => match !== undefined)
        })
    )
  }

  Scenario('Every tracked feature file is loaded by a feature spec', ({ When, Then }) => {
    When('the tracked feature files and feature specs are inspected', () => {
      trackedFeatureFiles = listTrackedFeatureFiles()
      loadedFeatureFiles = listLoadedFeatureFiles()
    })

    Then('every tracked feature file is loaded by a spec', () => {
      const missingFeatureFiles = trackedFeatureFiles.filter((featureFile) => !loadedFeatureFiles.has(featureFile))

      expect(
        missingFeatureFiles,
        `Expected every tracked feature file to be loaded by a spec, but these are missing: ${missingFeatureFiles.join(', ')}`
      ).toEqual([])
    })
  })
})
