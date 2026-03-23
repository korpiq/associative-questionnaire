import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { afterAll, expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { packageSurveyFromCli } from '../../../src/cli/package-survey'
import { packageTargetFromCli } from '../../../src/cli/package-target'

const feature = await loadFeature('tests/integration/package-deployment-cli.feature')

describeFeature(feature, ({ Scenario }) => {
  const repositoryRoot = process.cwd()
  const createdTargetDirectories: string[] = []
  let targetName = ''
  let targetPath = ''
  let surveyPath = ''
  let commandOutput = ''
  let tarballPath = ''

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }

    return parseYaml(docString) as T
  }

  function writeSurvey(targetDirectory: string, surveyName: string): void {
    const surveyDirectory = join(targetDirectory, 'surveys', surveyName)

    mkdirSync(surveyDirectory, { recursive: true })
    writeFileSync(
      join(surveyDirectory, 'survey.json'),
      JSON.stringify(
        {
          title: `Survey ${surveyName}`,
          sections: {
            basics: {
              title: 'Basics',
              questions: {
                color: {
                  title: 'Color',
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
  }

  function writeWorkspace(): void {
    const targetDirectory = join(repositoryRoot, 'targets', targetName)

    mkdirSync(targetDirectory, { recursive: true })
    writeFileSync(
      join(targetDirectory, 'target.json'),
      JSON.stringify(
        {
          type: 'container',
          containerName: 'cli-target',
          publicDir: '/srv/www/surveys',
          cgiDir: '/srv/www/cgi-bin',
          dataDir: '/srv/data/surveys',
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
    writeSurvey(targetDirectory, 'alpha')
    writeSurvey(targetDirectory, 'beta')

    targetPath = join('targets', targetName)
    surveyPath = join('targets', targetName, 'surveys', 'beta')
  }

  afterAll(() => {
    createdTargetDirectories.forEach((directory) => {
      rmSync(directory, { recursive: true, force: true })
    })
  })

  Scenario('Packaging a target path includes every survey in that target', ({ Given, And, When, Then }) => {
    Given('an isolated workspace target for deployment packaging CLI coverage', () => {
      targetName = `test-package-cli-target-${Date.now()}-a`
      createdTargetDirectories.push(join(repositoryRoot, 'targets', targetName))
      commandOutput = ''
      tarballPath = ''
      targetPath = ''
      surveyPath = ''
    })

    And('the isolated workspace target has a container deployment target with two surveys', () => {
      writeWorkspace()
    })

    When('I package the target path through the CLI', () => {
      commandOutput = JSON.stringify(
        packageTargetFromCli(['node', 'script', targetPath], repositoryRoot)
      )
      tarballPath = JSON.parse(commandOutput).tarballPath as string
    })

    Then('the package CLI output selects surveys:', (_ctx, docString) => {
      expect(JSON.parse(commandOutput).selectedSurveys).toEqual(parseYamlDocString(docString))
    })

    And('the package CLI tarball exists', () => {
      expect(existsSync(tarballPath)).toBe(true)
    })
  })

  Scenario('Packaging a survey path includes only that survey', ({ Given, And, When, Then }) => {
    Given('an isolated workspace target for deployment packaging CLI coverage', () => {
      targetName = `test-package-cli-target-${Date.now()}-b`
      createdTargetDirectories.push(join(repositoryRoot, 'targets', targetName))
      commandOutput = ''
      tarballPath = ''
      targetPath = ''
      surveyPath = ''
    })

    And('the isolated workspace target has a container deployment target with two surveys', () => {
      writeWorkspace()
    })

    When('I package the survey path through the CLI', () => {
      commandOutput = JSON.stringify(
        packageSurveyFromCli(['node', 'script', surveyPath], repositoryRoot)
      )
      tarballPath = JSON.parse(commandOutput).tarballPath as string
    })

    Then('the package CLI output selects surveys:', (_ctx, docString) => {
      expect(JSON.parse(commandOutput).selectedSurveys).toEqual(parseYamlDocString(docString))
    })

    And('the package CLI tarball exists', () => {
      expect(existsSync(tarballPath)).toBe(true)
      expect(readFileSync(tarballPath).length).toBeGreaterThan(0)
    })
  })
})
