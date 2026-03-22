import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { afterAll, expect } from 'vitest'

import { prepareGeneratedContainerLayout } from '../../../src/deploy/prepare-generated-container-layout'

const feature = await loadFeature('tests/integration/prepare-generated-container-layout.feature')

describeFeature(feature, ({ Scenario }) => {
  const createdWorkspaceDirectories: string[] = []
  let workspaceDirectory = ''
  let containerRoot = ''

  function writeSurveyWorkspace(): void {
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
          baseUrl: 'https://example.test',
          staticUriPath: '/surveys',
          cgiUriPath: '/cgi-bin',
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

  function publicSurveyDirectory(): string {
    return join(containerRoot, 'srv', 'sites', 'example.test', 'www', 'surveys', 'basic')
  }

  function cgiSurveyDirectory(): string {
    return join(containerRoot, 'srv', 'sites', 'example.test', 'www', 'cgi-bin', 'basic')
  }

  function privateSurveyDirectory(): string {
    return join(containerRoot, 'srv', 'sites', 'example.test', 'www', 'data', 'basic')
  }

  afterAll(() => {
    createdWorkspaceDirectories.forEach((directory) => {
      rmSync(directory, { recursive: true, force: true })
    })
  })

  Scenario(
    'Canonical survey artifacts are written under the configured target roots',
    ({ Given, And, When, Then }) => {
      Given('an isolated workspace for generated container layout', () => {
        workspaceDirectory = mkdtempSync(join(process.cwd(), '.test-container-layout-'))
        createdWorkspaceDirectories.push(workspaceDirectory)
        containerRoot = ''
      })

      And('the isolated workspace has a container deployment target and one survey', () => {
        writeSurveyWorkspace()
      })

      When('the generated container layout is prepared', () => {
        containerRoot = prepareGeneratedContainerLayout({
          workspaceDirectory,
          targetName: 'example'
        }).containerRoot
      })

      Then('the generated container layout contains the survey public files', () => {
        expect(existsSync(join(publicSurveyDirectory(), 'index.html'))).toBe(true)
        expect(existsSync(join(publicSurveyDirectory(), 'ok.html'))).toBe(true)
        expect(existsSync(join(publicSurveyDirectory(), 'fail.html'))).toBe(true)
      })

      And('the generated container layout contains the survey CGI files', () => {
        expect(existsSync(join(cgiSurveyDirectory(), 'save.cgi'))).toBe(true)
        expect(existsSync(join(cgiSurveyDirectory(), 'report.cgi'))).toBe(true)
      })

      And('the generated container layout contains the survey private files', () => {
        expect(existsSync(join(privateSurveyDirectory(), 'survey.json'))).toBe(true)
      })

      And('the generated survey page posts to the configured survey CGI URL', () => {
        expect(readFileSync(join(publicSurveyDirectory(), 'index.html'), 'utf8')).toContain(
          'action="https://example.test/cgi-bin/basic/save.cgi?ok=https%3A%2F%2Fexample.test%2Fsurveys%2Fbasic%2Fok.html&fail=https%3A%2F%2Fexample.test%2Fsurveys%2Fbasic%2Ffail.html"'
        )
      })

      And('the generated save CGI file starts with the target node executable', () => {
        expect(readFileSync(join(cgiSurveyDirectory(), 'save.cgi'), 'utf8').startsWith('#!/usr/bin/node')).toBe(true)
      })

      And('the generated save CGI file is executable', () => {
        expect(statSync(join(cgiSurveyDirectory(), 'save.cgi')).mode & 0o111).not.toBe(0)
      })

      And('the generated private survey file contains the survey title', () => {
        expect(readFileSync(join(privateSurveyDirectory(), 'survey.json'), 'utf8')).toContain(
          '"title": "Example survey"'
        )
      })
    }
  )
})
