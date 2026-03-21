import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { afterAll, expect } from 'vitest'

const feature = await loadFeature('tests/integration/clean.feature')

describeFeature(feature, ({ Scenario }) => {
  const createdArtifactRoots = new Set<string>()
  let commandOutput = ''
  let commandError: Error | null = null

  function writeGeneratedArtifacts(): void {
    mkdirSync(join(process.cwd(), 'dist', 'src'), { recursive: true })
    writeFileSync(join(process.cwd(), 'dist', 'src', 'index.js'), 'export {}\n')

    mkdirSync(join(process.cwd(), 'deploy', 'generated', 'runtime'), { recursive: true })
    writeFileSync(
      join(process.cwd(), 'deploy', 'generated', 'runtime', 'runtime-cgi.js'),
      'export {}\n'
    )

    createdArtifactRoots.add(join(process.cwd(), 'dist'))
    createdArtifactRoots.add(join(process.cwd(), 'deploy', 'generated'))
  }

  afterAll(() => {
    createdArtifactRoots.forEach((artifactRoot) => {
      rmSync(artifactRoot, { recursive: true, force: true })
    })
  })

  Scenario('Generated build directories are removed', ({ Given, When, Then, And, But }) => {
    Given('the workspace has generated build artifacts', () => {
      commandOutput = ''
      commandError = null
      writeGeneratedArtifacts()
      expect(existsSync(join(process.cwd(), 'dist'))).toBe(true)
      expect(existsSync(join(process.cwd(), 'deploy', 'generated'))).toBe(true)
    })

    When('I run {string}', (_ctx, command) => {
      const [executable, ...args] = command.split(' ')
      const result = spawnSync(executable, args, {
        cwd: process.cwd(),
        encoding: 'utf8'
      })

      commandOutput = `${result.stdout}${result.stderr}`.trim()
      commandError =
        result.status === 0
          ? null
          : new Error(`Command failed with status ${result.status}: ${result.stdout}${result.stderr}`)
    })

    Then('the command output is:', (_ctx, docString) => {
      expect(commandError?.message ?? commandOutput).toBe((docString ?? '').trim())
    })

    And('the generated build artifacts are removed', () => {
      expect(commandError).toBeNull()
      expect(existsSync(join(process.cwd(), 'dist'))).toBe(false)
      expect(existsSync(join(process.cwd(), 'deploy', 'generated'))).toBe(false)
    })

    But('the tracked deploy templates still exist', () => {
      expect(existsSync(join(process.cwd(), 'deploy', 'templates', 'save-survey.js'))).toBe(true)
      expect(existsSync(join(process.cwd(), 'deploy', 'templates', 'report-survey.template.js'))).toBe(true)
    })
  })
})
