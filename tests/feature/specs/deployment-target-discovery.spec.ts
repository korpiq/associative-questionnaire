import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { afterAll, expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { loadDeploymentTarget } from '../../../src'

const feature = await loadFeature('tests/feature/deployment-target-discovery.feature')

describeFeature(feature, ({ Scenario }) => {
  const createdWorkspaceDirectories: string[] = []
  let workspaceDirectory = ''
  let targetName = ''
  let loadedTarget:
    | {
        targetName: string
        surveys: Array<{
          surveyName: string
          surveyPath: string
          templatePath: string
        }>
      }
    | undefined
  let loadError: Error | null = null

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }

    return parseYaml(docString) as T
  }

  function targetDirectoryPath(): string {
    return join(workspaceDirectory, 'targets', targetName)
  }

  function writeSurveyFiles(surveyName: string): void {
    const surveyDirectory = join(targetDirectoryPath(), 'surveys', surveyName)
    mkdirSync(surveyDirectory, { recursive: true })
    writeFileSync(
      join(surveyDirectory, 'survey.json'),
      JSON.stringify({
        title: `Survey ${surveyName}`,
        sections: {}
      })
    )
    writeFileSync(join(surveyDirectory, 'template.html'), '<!DOCTYPE html><html><body></body></html>')
  }

  afterAll(() => {
    createdWorkspaceDirectories.forEach((directory) => {
      rmSync(directory, { recursive: true, force: true })
    })
  })

  Scenario(
    'A target is loaded from targets/<target-name>/target.json and discovers its surveys',
    ({ Given, And, When, Then }) => {
      Given('an empty deployment workspace', () => {
        workspaceDirectory = mkdtempSync(join(process.cwd(), '.test-deployment-target-'))
        createdWorkspaceDirectories.push(workspaceDirectory)
        targetName = ''
        loadedTarget = undefined
        loadError = null
      })

      And('the target directory name is {string}', (_ctx, value) => {
        targetName = value
      })

      And('the target configuration file contains:', (_ctx, docString) => {
        const targetDirectory = targetDirectoryPath()
        mkdirSync(targetDirectory, { recursive: true })
        writeFileSync(join(targetDirectory, 'target.json'), docString ?? '')
      })

      And('the target has survey directories:', (_ctx, docString) => {
        parseYamlDocString<string[]>(docString).forEach((surveyName) => {
          writeSurveyFiles(surveyName)
        })
      })

      When('the deployment target is loaded from the workspace', () => {
        try {
          loadedTarget = loadDeploymentTarget({
            workspaceDirectory,
            targetName
          })
          loadError = null
        } catch (error) {
          loadedTarget = undefined
          loadError = error as Error
        }
      })

      Then('the loaded target name is {string}', (_ctx, value) => {
        expect(loadError).toBeNull()
        expect(loadedTarget?.targetName).toBe(value)
      })

      And('the loaded survey names are:', (_ctx, docString) => {
        expect(loadError).toBeNull()
        expect(loadedTarget?.surveys.map((survey) => survey.surveyName)).toEqual(
          parseYamlDocString(docString)
        )
      })

      And('the loaded survey file paths are:', (_ctx, docString) => {
        expect(loadError).toBeNull()
        expect(
          loadedTarget?.surveys.map((survey) => relative(workspaceDirectory, survey.surveyPath))
        ).toEqual(parseYamlDocString(docString))
      })

      And('the loaded template file paths are:', (_ctx, docString) => {
        expect(loadError).toBeNull()
        expect(
          loadedTarget?.surveys.map((survey) => relative(workspaceDirectory, survey.templatePath))
        ).toEqual(parseYamlDocString(docString))
      })
    }
  )

  Scenario('A target without target.json is rejected', ({ Given, And, When, Then }) => {
    Given('an empty deployment workspace', () => {
      workspaceDirectory = mkdtempSync(join(process.cwd(), '.test-deployment-target-'))
      createdWorkspaceDirectories.push(workspaceDirectory)
      targetName = ''
      loadedTarget = undefined
      loadError = null
    })

    And('the target directory name is {string}', (_ctx, value) => {
      targetName = value
    })

    When('the deployment target is loaded from the workspace', () => {
      try {
        loadedTarget = loadDeploymentTarget({
          workspaceDirectory,
          targetName
        })
        loadError = null
      } catch (error) {
        loadedTarget = undefined
        loadError = error as Error
      }
    })

    Then('loading the deployment target is rejected with {string}', (_ctx, message) => {
      expect(loadedTarget).toBeUndefined()
      expect(loadError?.message).toBe(message)
    })
  })
})
