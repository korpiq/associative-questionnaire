import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { normalizeSurveyAnswerFields, parseSurvey } from '../../../src'

const feature = await loadFeature('tests/feature/cgi-request-normalization.feature')

type BrowserFormFields = Record<string, string | string[]>

describeFeature(feature, ({ Scenario }) => {
  let surveyInput: unknown
  let formFieldsInput: BrowserFormFields
  let normalizationResult: unknown
  let normalizationError: Error | null

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }

    return parseYaml(docString) as T
  }

  Scenario('Browser form fields are normalized using the survey definition', ({ Given, And, When, Then }) => {
    Given('survey content:', (_ctx, docString) => {
      surveyInput = parseYamlDocString(docString)
      formFieldsInput = {}
      normalizationResult = undefined
      normalizationError = null
    })

    And('browser form fields are:', (_ctx, docString) => {
      formFieldsInput = parseYamlDocString(docString)
    })

    When('the browser form fields are normalized for saving', () => {
      try {
        normalizationResult = normalizeSurveyAnswerFields(parseSurvey(surveyInput), formFieldsInput)
        normalizationError = null
      } catch (error) {
        normalizationResult = undefined
        normalizationError = error as Error
      }
    })

    Then('the saved answer file is:', (_ctx, docString) => {
      const expectedAnswerFile = parseYamlDocString<Record<string, unknown>>(docString)

      expect(normalizationError).toBeNull()
      expect(normalizationResult).toEqual(expectedAnswerFile)
    })
  })

  Scenario('Invalid associative browser form fields are rejected', ({ Given, And, When, Then }) => {
    Given('survey content:', (_ctx, docString) => {
      surveyInput = parseYamlDocString(docString)
      formFieldsInput = {}
      normalizationResult = undefined
      normalizationError = null
    })

    And('browser form fields are:', (_ctx, docString) => {
      formFieldsInput = parseYamlDocString(docString)
    })

    When('the browser form fields are normalized for saving', () => {
      try {
        normalizationResult = normalizeSurveyAnswerFields(parseSurvey(surveyInput), formFieldsInput)
        normalizationError = null
      } catch (error) {
        normalizationResult = undefined
        normalizationError = error as Error
      }
    })

    Then('the browser form fields are rejected', () => {
      expect(normalizationResult).toBeUndefined()
      expect(normalizationError).toBeInstanceOf(Error)
    })

    And('the normalization error is:', (_ctx, docString) => {
      expect(normalizationError?.message).toBe(docString)
    })
  })

  Scenario('Answers that do not match the survey definition are rejected', ({ Given, And, When, Then }) => {
    Given('survey content:', (_ctx, docString) => {
      surveyInput = parseYamlDocString(docString)
      formFieldsInput = {}
      normalizationResult = undefined
      normalizationError = null
    })

    And('browser form fields are:', (_ctx, docString) => {
      formFieldsInput = parseYamlDocString(docString)
    })

    When('the browser form fields are normalized for saving', () => {
      try {
        normalizationResult = normalizeSurveyAnswerFields(parseSurvey(surveyInput), formFieldsInput)
        normalizationError = null
      } catch (error) {
        normalizationResult = undefined
        normalizationError = error as Error
      }
    })

    Then('the browser form fields are rejected', () => {
      expect(normalizationResult).toBeUndefined()
      expect(normalizationError).toBeInstanceOf(Error)
    })

    And('the normalization error is:', (_ctx, docString) => {
      expect(normalizationError?.message).toBe(docString)
    })
  })
})
