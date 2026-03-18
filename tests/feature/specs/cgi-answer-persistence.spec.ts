import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { afterAll, expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { parseSurvey, saveSurveyAnswerSubmission } from '../../../src'

const feature = await loadFeature('tests/feature/cgi-answer-persistence.feature')

describeFeature(feature, ({ Scenario }) => {
  const createdHomeDirectories: string[] = []
  let effectiveHomeDirectory = ''
  let surveyName = ''
  let surveyInput: unknown
  let requestBody = ''
  let replacementRequestBody = ''
  let respondentId = ''
  let savedAnswerFilePath = ''

  afterAll(() => {
    createdHomeDirectories.forEach((directory) => {
      rmSync(directory, { recursive: true, force: true })
    })
  })

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }

    return parseYaml(docString) as T
  }

  Scenario('A valid survey submission is written into the survey answers directory', ({ Given, And, When, Then }) => {
    Given('an empty saver home directory', () => {
      effectiveHomeDirectory = mkdtempSync(join(process.cwd(), '.test-saver-home-'))
      createdHomeDirectories.push(effectiveHomeDirectory)
      surveyName = ''
      surveyInput = undefined
      requestBody = ''
      replacementRequestBody = ''
      respondentId = ''
      savedAnswerFilePath = ''
    })

    And('the survey name is {string}', (_ctx, value) => {
      surveyName = value
    })

    And('survey content:', (_ctx, docString) => {
      surveyInput = parseYamlDocString(docString)
    })

    And('the URL-encoded request body is:', (_ctx, docString) => {
      requestBody = docString ?? ''
    })

    And('the respondent id is {string}', (_ctx, value) => {
      respondentId = value
    })

    When('the survey submission is saved', () => {
      const result = saveSurveyAnswerSubmission({
        survey: parseSurvey(surveyInput),
        surveyName,
        requestBody,
        respondentId,
        effectiveHomeDirectory
      })

      savedAnswerFilePath = result.savedAnswerFilePath
    })

    Then('one saved answer file exists for the survey', () => {
      const surveyDirectory = join(
        effectiveHomeDirectory,
        '.local',
        'share',
        'associative-survey',
        'answers',
        surveyName
      )
      const entries = readdirSync(surveyDirectory)
      const [entry] = entries

      expect(entries).toHaveLength(1)
      expect(entry).toBeDefined()
      expect(savedAnswerFilePath).toBe(join(surveyDirectory, entry!))
    })

    And('the saved answer file contains:', (_ctx, docString) => {
      const expectedAnswerFile = parseYamlDocString<Record<string, unknown>>(docString)
      const savedAnswerFile = JSON.parse(readFileSync(savedAnswerFilePath, 'utf8')) as unknown

      expect(savedAnswerFile).toEqual(expectedAnswerFile)
    })
  })

  Scenario('Saving again for the same respondent replaces the existing survey answer file', ({ Given, And, When, Then }) => {
    Given('an empty saver home directory', () => {
      effectiveHomeDirectory = mkdtempSync(join(process.cwd(), '.test-saver-home-'))
      createdHomeDirectories.push(effectiveHomeDirectory)
      surveyName = ''
      surveyInput = undefined
      requestBody = ''
      replacementRequestBody = ''
      respondentId = ''
      savedAnswerFilePath = ''
    })

    And('the survey name is {string}', (_ctx, value) => {
      surveyName = value
    })

    And('survey content:', (_ctx, docString) => {
      surveyInput = parseYamlDocString(docString)
    })

    And('the first URL-encoded request body is:', (_ctx, docString) => {
      requestBody = docString ?? ''
    })

    And('the replacement URL-encoded request body is:', (_ctx, docString) => {
      replacementRequestBody = docString ?? ''
    })

    And('the respondent id is {string}', (_ctx, value) => {
      respondentId = value
    })

    When('the first survey submission is saved', () => {
      saveSurveyAnswerSubmission({
        survey: parseSurvey(surveyInput),
        surveyName,
        requestBody,
        respondentId,
        effectiveHomeDirectory
      })
    })

    And('the replacement survey submission is saved', () => {
      const result = saveSurveyAnswerSubmission({
        survey: parseSurvey(surveyInput),
        surveyName,
        requestBody: replacementRequestBody,
        respondentId,
        effectiveHomeDirectory
      })

      savedAnswerFilePath = result.savedAnswerFilePath
    })

    Then('one saved answer file exists for the survey', () => {
      const surveyDirectory = join(
        effectiveHomeDirectory,
        '.local',
        'share',
        'associative-survey',
        'answers',
        surveyName
      )
      const entries = readdirSync(surveyDirectory)
      const [entry] = entries

      expect(entries).toHaveLength(1)
      expect(entry).toBeDefined()
      expect(savedAnswerFilePath).toBe(join(surveyDirectory, entry!))
    })

    And('the saved answer file contains:', (_ctx, docString) => {
      const expectedAnswerFile = parseYamlDocString<Record<string, unknown>>(docString)
      const savedAnswerFile = JSON.parse(readFileSync(savedAnswerFilePath, 'utf8')) as unknown

      expect(savedAnswerFile).toEqual(expectedAnswerFile)
    })
  })
})
