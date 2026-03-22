import { spawnSync } from 'node:child_process'

import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { afterAll, expect } from 'vitest'

const feature = await loadFeature('tests/tooling/test-visual-launch.feature')

describeFeature(feature, ({ Scenario, defineSteps }) => {
  const containerName = 'associative-survey-visual'
  let launcherOutput = ''

  function cleanupContainer(): void {
    spawnSync('docker', ['rm', '-f', containerName], {
      cwd: process.cwd(),
      encoding: 'utf8'
    })
  }

  afterAll(() => {
    cleanupContainer()
  })

  defineSteps(({ Then, And }) => {
    Then('the launcher output contains {string}', (_ctx, expected) => {
      expect(launcherOutput).toContain(expected)
    })

    And('the launcher output contains {string}', (_ctx, expected) => {
      expect(launcherOutput).toContain(expected)
    })
  })

  Scenario(
    'Visual launcher smoke-checks the showcase container and prints the inspection URLs',
    ({ When }) => {
      When('I run the visual test launcher', () => {
        cleanupContainer()

        const result = spawnSync('bash', ['scripts/test-visual.sh'], {
          cwd: process.cwd(),
          encoding: 'utf8'
        })

        launcherOutput = `${result.stdout}${result.stderr}`.trim()

        if (result.status !== 0) {
          throw new Error(`Command failed: bash scripts/test-visual.sh\n${launcherOutput}`.trim())
        }
      })
    }
  )
})
