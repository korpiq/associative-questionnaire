import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { afterAll, expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { parseSurvey } from '../../../src'
import { installGeneratedContainerRuntimeData } from '../../../src/deploy/install-generated-container-runtime-data'
import { listTargetDeployedSurveys } from '../../../src/deploy/list-target-deployed-surveys'
import type { LoadedDeploymentTarget } from '../../../src/deploy/load-deployment-target'
import { readTargetNameArgument } from '../../../src/cli/read-target-name-argument'

const feature = await loadFeature('tests/tooling/repository-helpers.feature')

describeFeature(feature, ({ Scenario, defineSteps }) => {
  const createdDirectories: string[] = []
  let resolvedTargetName = ''
  let targetForListing: LoadedDeploymentTarget | undefined
  let listedSurveys: ReturnType<typeof listTargetDeployedSurveys> = []
  let workspaceDirectory = ''
  let installedSurveyPath = ''
  let installedAnswerPath = ''

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }

    return parseYaml(docString) as T
  }

  afterAll(() => {
    createdDirectories.forEach((directory) => {
      rmSync(directory, { recursive: true, force: true })
    })
  })

  defineSteps(({ When, Then }) => {
    When('I read the target name from argv:', (_ctx, docString) => {
      resolvedTargetName = readTargetNameArgument(parseYamlDocString(docString), 'sample')
    })

    Then('the resolved target name is {string}', (_ctx, expected) => {
      expect(resolvedTargetName).toBe(expected)
    })
  })

  Scenario('Project bootstrap loads the survey parser export', ({ When, Then }) => {
    When('the project bootstrap exports are loaded', () => {
      resolvedTargetName = typeof parseSurvey
    })

    Then('the exported survey parser is a function', () => {
      expect(resolvedTargetName).toBe('function')
    })
  })

  Scenario('Target-name helper uses the provided target', () => {})

  Scenario('Target-name helper falls back to the default target', () => {})

  Scenario('Discovered target surveys map to generated public survey pages', ({ Given, When, Then }) => {
    Given('the loaded deployment target for target listing is:', (_ctx, docString) => {
      targetForListing = parseYamlDocString(docString) as LoadedDeploymentTarget
      listedSurveys = []
    })

    When('the deployed surveys are listed for that target', () => {
      if (!targetForListing) {
        throw new Error('Expected a deployment target for target listing')
      }

      listedSurveys = listTargetDeployedSurveys(targetForListing)
    })

    Then('the listed deployed surveys are:', (_ctx, docString) => {
      expect(listedSurveys).toEqual(parseYamlDocString(docString))
    })
  })

  Scenario('Generated container runtime data is copied into the configured runtime directories', ({ Given, And, When, Then }) => {
    Given('an isolated workspace for generated container runtime data', () => {
      workspaceDirectory = mkdtempSync(join(process.cwd(), '.test-container-runtime-'))
      createdDirectories.push(workspaceDirectory)
      installedSurveyPath = ''
      installedAnswerPath = ''
    })

    And(
      'the isolated workspace has generated survey and answer files for container runtime installation',
      () => {
        const generatedSurveyRoot = join(workspaceDirectory, 'generated', 'surveys')
        const generatedAnswersRoot = join(workspaceDirectory, 'generated', 'answers')

        mkdirSync(generatedSurveyRoot, { recursive: true })
        mkdirSync(join(generatedAnswersRoot, 'survey'), { recursive: true })
        writeFileSync(join(generatedSurveyRoot, 'survey.json'), '{"title":"Example survey"}')
        writeFileSync(join(generatedAnswersRoot, 'survey', 'respondent.json'), '{"answers":{}}')

        installedSurveyPath = join(workspaceDirectory, 'runtime', 'surveys', 'survey.json')
        installedAnswerPath = join(
          workspaceDirectory,
          'runtime',
          'answers',
          'survey',
          'respondent.json'
        )
      }
    )

    When('the generated container runtime data is installed', () => {
      installGeneratedContainerRuntimeData({
        generatedSurveyRoot: join(workspaceDirectory, 'generated', 'surveys'),
        generatedAnswersRoot: join(workspaceDirectory, 'generated', 'answers'),
        surveysDataDir: join(workspaceDirectory, 'runtime', 'surveys'),
        answersDataDir: join(workspaceDirectory, 'runtime', 'answers')
      })
    })

    Then('the installed runtime survey file contains:', (_ctx, docString) => {
      expect(readFileSync(installedSurveyPath, 'utf8')).toBe((docString ?? '').trim())
    })

    And('the installed runtime answer file contains:', (_ctx, docString) => {
      expect(readFileSync(installedAnswerPath, 'utf8')).toBe((docString ?? '').trim())
    })
  })
})
