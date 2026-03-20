import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'

import { afterEach, describe, expect, it } from 'vitest'

import { prepareGeneratedSshDeploymentPackage } from '../../src/deploy/prepare-generated-ssh-deployment-package'

const createdWorkspaceDirectories: string[] = []

afterEach(() => {
  createdWorkspaceDirectories.forEach((directory) => {
    rmSync(directory, { recursive: true, force: true })
  })
  createdWorkspaceDirectories.length = 0
})

function writeWorkspace(workspaceDirectory: string): void {
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

describe('prepareGeneratedSshDeploymentPackage', () => {
  it('builds a tarball with a setup script and the canonical per-survey payload layout', () => {
    const workspaceDirectory = mkdtempSync(join(process.cwd(), '.test-ssh-package-'))
    createdWorkspaceDirectories.push(workspaceDirectory)
    writeWorkspace(workspaceDirectory)

    const result = prepareGeneratedSshDeploymentPackage({
      workspaceDirectory,
      targetName: 'example-vps'
    })

    expect(existsSync(result.tarballPath)).toBe(true)
    expect(existsSync(result.setupScriptPath)).toBe(true)
    expect(readFileSync(result.setupScriptPath, 'utf8')).toContain('~/sites/example.test/www/surveys')
    expect(readFileSync(result.setupScriptPath, 'utf8')).toContain('chmod 755')

    const tarballListing = listTarEntries(readFileSync(result.tarballPath))

    expect(tarballListing).toContain('./setup.sh')
    expect(tarballListing).toContain('./payload/public/basic/index.html')
    expect(tarballListing).toContain('./payload/public/basic/ok.html')
    expect(tarballListing).toContain('./payload/public/basic/fail.html')
    expect(tarballListing).toContain('./payload/cgi/basic/save.cgi')
    expect(tarballListing).toContain('./payload/cgi/basic/report.cgi')
    expect(tarballListing).toContain('./payload/data/basic/survey.json')
  })
})

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
