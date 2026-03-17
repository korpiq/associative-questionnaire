import { mkdtempSync, rmSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { afterAll, expect } from 'vitest'

import { ensureSurveyAnswerStorage } from '../../../src'

const feature = await loadFeature('tests/feature/cgi-runtime-storage.feature')

describeFeature(feature, ({ Scenario }) => {
  const createdHomeDirectories: string[] = []
  let effectiveHomeDirectory = ''
  let surveyName = ''
  let runtimeAnswersRoot = ''
  let surveyAnswersDirectory = ''

  afterAll(() => {
    createdHomeDirectories.forEach((directory) => {
      rmSync(directory, { recursive: true, force: true })
    })
  })

  Scenario('The answers root and survey directory are created on demand', ({ Given, And, When, Then }) => {
    Given('an empty effective user home directory', () => {
      effectiveHomeDirectory = mkdtempSync(join(process.cwd(), '.test-home-'))
      createdHomeDirectories.push(effectiveHomeDirectory)
      surveyName = ''
      runtimeAnswersRoot = ''
      surveyAnswersDirectory = ''
    })

    And('the survey name is {string}', (_ctx, value) => {
      surveyName = value
    })

    When('the saver runtime storage is ensured', () => {
      const paths = ensureSurveyAnswerStorage(surveyName, effectiveHomeDirectory)

      runtimeAnswersRoot = paths.runtimeAnswersRoot
      surveyAnswersDirectory = paths.surveyAnswersDirectory
    })

    Then('the runtime answers root exists under the effective user home directory', () => {
      expect(runtimeAnswersRoot).toBe(
        join(effectiveHomeDirectory, '.local', 'share', 'associative-survey', 'answers')
      )
      expect(statSync(runtimeAnswersRoot).isDirectory()).toBe(true)
    })

    And('the survey answers directory exists', () => {
      expect(surveyAnswersDirectory).toBe(join(runtimeAnswersRoot, surveyName))
      expect(statSync(surveyAnswersDirectory).isDirectory()).toBe(true)
    })
  })
})
