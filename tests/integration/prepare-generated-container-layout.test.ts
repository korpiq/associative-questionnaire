import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { prepareGeneratedContainerLayout } from '../../src/deploy/prepare-generated-container-layout'

const createdWorkspaceDirectories: string[] = []

afterEach(() => {
  createdWorkspaceDirectories.forEach((directory) => {
    rmSync(directory, { recursive: true, force: true })
  })
  createdWorkspaceDirectories.length = 0
})

function writeSurveyWorkspace(workspaceDirectory: string): void {
  const targetDirectory = join(workspaceDirectory, 'targets', 'example')
  const surveyDirectory = join(targetDirectory, 'surveys', 'basic')
  const templateDirectory = join(workspaceDirectory, 'deploy', 'templates')

  mkdirSync(surveyDirectory, { recursive: true })
  mkdirSync(templateDirectory, { recursive: true })
  writeFileSync(
    join(targetDirectory, 'target.json'),
    JSON.stringify(
      {
        type: 'container',
        containerName: 'example-container',
        publicDir: '/srv/sites/example.test/www/surveys',
        cgiDir: '/srv/sites/example.test/www/cgi-bin',
        dataDir: '/srv/sites/example.test/www/data',
        publicBaseUrl: 'https://example.test',
        cgiBaseUrl: 'https://example.test/cgi-bin',
        nodeExecutable: '/usr/bin/node',
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

describe('prepareGeneratedContainerLayout', () => {
  it('writes canonical survey artifacts under the configured target roots', () => {
    const workspaceDirectory = mkdtempSync(join(process.cwd(), '.test-container-layout-'))
    createdWorkspaceDirectories.push(workspaceDirectory)
    writeSurveyWorkspace(workspaceDirectory)

    const result = prepareGeneratedContainerLayout({
      workspaceDirectory,
      targetName: 'example'
    })
    const containerRoot = result.containerRoot

    const publicSurveyDirectory = join(containerRoot, 'srv', 'sites', 'example.test', 'www', 'surveys', 'basic')
    const cgiSurveyDirectory = join(containerRoot, 'srv', 'sites', 'example.test', 'www', 'cgi-bin', 'basic')
    const privateSurveyDirectory = join(containerRoot, 'srv', 'sites', 'example.test', 'www', 'data', 'basic')

    expect(existsSync(join(publicSurveyDirectory, 'index.html'))).toBe(true)
    expect(existsSync(join(publicSurveyDirectory, 'ok.html'))).toBe(true)
    expect(existsSync(join(publicSurveyDirectory, 'fail.html'))).toBe(true)
    expect(existsSync(join(cgiSurveyDirectory, 'save.cgi'))).toBe(true)
    expect(existsSync(join(cgiSurveyDirectory, 'report.cgi'))).toBe(true)
    expect(existsSync(join(privateSurveyDirectory, 'survey.json'))).toBe(true)

    expect(readFileSync(join(publicSurveyDirectory, 'index.html'), 'utf8')).toContain(
      'action="https://example.test/cgi-bin/basic/save.cgi?ok=https%3A%2F%2Fexample.test%2Fbasic%2Fok.html&fail=https%3A%2F%2Fexample.test%2Fbasic%2Ffail.html"'
    )
    expect(readFileSync(join(cgiSurveyDirectory, 'save.cgi'), 'utf8').startsWith('#!/usr/bin/node')).toBe(true)
    expect(readFileSync(join(privateSurveyDirectory, 'survey.json'), 'utf8')).toContain(
      '"title": "Example survey"'
    )
  })
})
