import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'

import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { afterAll, expect } from 'vitest'

import { prepareGeneratedSshDeploymentPackage } from '../../../src/deploy/prepare-generated-ssh-deployment-package'

const feature = await loadFeature('tests/integration/prepare-generated-ssh-deployment-package.feature')

describeFeature(feature, ({ Scenario }) => {
  const createdWorkspaceDirectories: string[] = []
  let workspaceDirectory = ''
  let tarballPath = ''
  let setupScriptPath = ''

  function writeWorkspace(): void {
    const targetDirectory = join(workspaceDirectory, 'targets', 'example-vps')
    const surveyDirectory = join(targetDirectory, 'surveys', 'basic')
    const templateDirectory = join(workspaceDirectory, 'deploy', 'templates')

    mkdirSync(surveyDirectory, { recursive: true })
    mkdirSync(templateDirectory, { recursive: true })

    writeFileSync(
      join(targetDirectory, 'target.json'),
      JSON.stringify(
        {
          type: 'ssh',
          sshTarget: 'deploy@example.test',
          publicDir: '~/sites/example.test/www/surveys',
          cgiDir: '~/sites/example.test/www/cgi-bin',
          dataDir: '~/sites/example.test/www/data',
          publicBaseUrl: 'https://example.test/surveys',
          cgiBaseUrl: 'https://example.test/cgi-bin',
          nodeExecutable: '/usr/local/bin/node',
          cgiExtension: '.cgi'
        },
        null,
        2
      )
    )
    writeFileSync(
      join(surveyDirectory, 'survey.json'),
      JSON.stringify(
        {
          title: 'Example survey',
          sections: {
            basics: {
              title: 'Basics',
              questions: {
                'favorite-color': {
                  title: 'Favorite color',
                  type: 'single-choice',
                  content: {
                    blue: 'Blue'
                  }
                }
              }
            }
          }
        },
        null,
        2
      )
    )
    writeFileSync(join(surveyDirectory, 'template.html'), '{{> root}}')
    writeFileSync(
      join(templateDirectory, 'save-survey.js'),
      '#!/usr/local/bin/node --experimental-specifier-resolution=node\nexport const kind = "save";\n'
    )
    writeFileSync(
      join(templateDirectory, 'report-survey.template.js'),
      '#!/usr/local/bin/node --experimental-specifier-resolution=node\nexport const kind = "report";\n'
    )
  }

  function listTarEntries(tarGzContents: Buffer): string[] {
    const tarContents = gunzipSync(tarGzContents)
    const entries: string[] = []
    let offset = 0

    while (offset + 512 <= tarContents.length) {
      const header = tarContents.subarray(offset, offset + 512)
      const name = header.subarray(0, 100).toString('utf8').replace(/\0.*$/, '')

      if (!name) {
        break
      }

      const sizeOctal = header.subarray(124, 136).toString('utf8').replace(/\0.*$/, '').trim()
      const size = sizeOctal ? Number.parseInt(sizeOctal, 8) : 0

      entries.push(name)
      offset += 512 + Math.ceil(size / 512) * 512
    }

    return entries
  }

  afterAll(() => {
    createdWorkspaceDirectories.forEach((directory) => {
      rmSync(directory, { recursive: true, force: true })
    })
  })

  Scenario('A tarball with canonical per-survey payload files is built', ({ Given, And, When, Then }) => {
    Given('an isolated workspace for generated SSH deployment packages', () => {
      workspaceDirectory = mkdtempSync(join(process.cwd(), '.test-ssh-package-'))
      createdWorkspaceDirectories.push(workspaceDirectory)
      tarballPath = ''
      setupScriptPath = ''
    })

    And('the isolated workspace has an SSH deployment target and one survey', () => {
      writeWorkspace()
    })

    When('the generated SSH deployment package is prepared', () => {
      const result = prepareGeneratedSshDeploymentPackage({
        workspaceDirectory,
        targetName: 'example-vps'
      })

      tarballPath = result.tarballPath
      setupScriptPath = result.setupScriptPath
    })

    Then('the generated SSH deployment tarball exists', () => {
      expect(existsSync(tarballPath)).toBe(true)
    })

    And('the generated SSH deployment setup script exists', () => {
      expect(existsSync(setupScriptPath)).toBe(true)
    })

    And('the generated SSH deployment setup script uses the target home-relative directories', () => {
      expect(readFileSync(setupScriptPath, 'utf8')).toContain('$HOME/sites/example.test/www/surveys')
    })

    And('the generated SSH deployment setup script restores CGI executability', () => {
      expect(readFileSync(setupScriptPath, 'utf8')).toContain('chmod 755')
    })

    And('the generated SSH deployment tarball contains the canonical per-survey payload files', () => {
      const tarballListing = listTarEntries(readFileSync(tarballPath))

      expect(tarballListing).toContain('./setup.sh')
      expect(tarballListing).toContain('./payload/public/basic/index.html')
      expect(tarballListing).toContain('./payload/public/basic/ok.html')
      expect(tarballListing).toContain('./payload/public/basic/fail.html')
      expect(tarballListing).toContain('./payload/cgi/basic/save.cgi')
      expect(tarballListing).toContain('./payload/cgi/basic/report.cgi')
      expect(tarballListing).toContain('./payload/data/basic/survey.json')
    })
  })
})
