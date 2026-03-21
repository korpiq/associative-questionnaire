import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { afterAll, expect } from 'vitest'

const feature = await loadFeature('tests/integration/nuke.feature')

describeFeature(feature, ({ Scenario }) => {
  const createdWorkspaceDirectories: string[] = []
  let workspaceDirectory = ''
  let commandOutput = ''
  let commandError: Error | null = null

  function packageScripts(): { clean: string; nuke: string } {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts?: Record<string, string>
    }

    if (!packageJson.scripts?.clean || !packageJson.scripts.nuke) {
      throw new Error('Expected clean and nuke scripts in package.json')
    }

    return {
      clean: packageJson.scripts.clean,
      nuke: packageJson.scripts.nuke
    }
  }

  function writeIsolatedWorkspace(): void {
    const scripts = packageScripts()

    workspaceDirectory = mkdtempSync(join(process.cwd(), '.test-nuke-'))
    createdWorkspaceDirectories.push(workspaceDirectory)

    mkdirSync(join(workspaceDirectory, 'dist', 'src'), { recursive: true })
    mkdirSync(join(workspaceDirectory, 'deploy', 'generated', 'runtime'), { recursive: true })
    mkdirSync(join(workspaceDirectory, 'deploy', 'templates'), { recursive: true })
    mkdirSync(join(workspaceDirectory, 'node_modules', 'example-package'), { recursive: true })

    writeFileSync(
      join(workspaceDirectory, 'package.json'),
      JSON.stringify(
        {
          name: 'nuke-test-workspace',
          private: true,
          scripts: {
            clean: scripts.clean,
            nuke: scripts.nuke
          }
        },
        null,
        2
      )
    )
    writeFileSync(join(workspaceDirectory, 'dist', 'src', 'index.js'), 'export {}\n')
    writeFileSync(
      join(workspaceDirectory, 'deploy', 'generated', 'runtime', 'runtime-cgi.js'),
      'export {}\n'
    )
    writeFileSync(
      join(workspaceDirectory, 'deploy', 'templates', 'save-survey.js'),
      '#!/usr/bin/env node\n'
    )
    writeFileSync(
      join(workspaceDirectory, 'deploy', 'templates', 'report-survey.template.js'),
      '#!/usr/bin/env node\n'
    )
    writeFileSync(join(workspaceDirectory, 'node_modules', 'example-package', 'package.json'), '{}\n')
  }

  afterAll(() => {
    createdWorkspaceDirectories.forEach((directory) => {
      rmSync(directory, { recursive: true, force: true })
    })
  })

  Scenario(
    'Generated build directories and node_modules are removed',
    ({ Given, When, Then, And, But }) => {
      Given('an isolated workspace has generated build artifacts and installed dependencies', () => {
        commandOutput = ''
        commandError = null
        writeIsolatedWorkspace()

        expect(existsSync(join(workspaceDirectory, 'dist'))).toBe(true)
        expect(existsSync(join(workspaceDirectory, 'deploy', 'generated'))).toBe(true)
        expect(existsSync(join(workspaceDirectory, 'node_modules'))).toBe(true)
      })

      When('I run {string} in the isolated workspace', (_ctx, command) => {
        const [executable, ...args] = command.split(' ')
        const result = spawnSync(executable, args, {
          cwd: workspaceDirectory,
          encoding: 'utf8'
        })

        commandOutput = `${result.stdout}${result.stderr}`.trim()
        commandError =
          result.status === 0
            ? null
            : new Error(`Command failed with status ${result.status}: ${result.stdout}${result.stderr}`)
      })

      Then('the command output is empty', () => {
        expect(commandError?.message ?? commandOutput).toBe('')
      })

      And('the isolated workspace generated build artifacts are removed', () => {
        expect(commandError).toBeNull()
        expect(existsSync(join(workspaceDirectory, 'dist'))).toBe(false)
        expect(existsSync(join(workspaceDirectory, 'deploy', 'generated'))).toBe(false)
        expect(existsSync(join(workspaceDirectory, 'node_modules'))).toBe(false)
      })

      But('the isolated workspace tracked deploy templates still exist', () => {
        expect(existsSync(join(workspaceDirectory, 'deploy', 'templates', 'save-survey.js'))).toBe(true)
        expect(
          existsSync(join(workspaceDirectory, 'deploy', 'templates', 'report-survey.template.js'))
        ).toBe(true)
      })
    }
  )
})
