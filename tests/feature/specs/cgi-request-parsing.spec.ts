import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { normalizeSurveyAnswerRequestBody, parseSurvey } from '../../../src'

const feature = await loadFeature('tests/feature/cgi-request-parsing.feature')

describeFeature(feature, ({ Scenario }) => {
  let surveyInput: unknown
  let requestBody = ''
  let normalizationResult: unknown
  let normalizationError: Error | null

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }

    return parseYaml(docString) as T
  }

  Scenario('URL-encoded browser form bodies are parsed and normalized', ({ Given, And, When, Then }) => {
    Given('survey content:', (_ctx, docString) => {
      surveyInput = parseYamlDocString(docString)
      requestBody = ''
      normalizationResult = undefined
      normalizationError = null
    })

    And('the URL-encoded request body is:', (_ctx, docString) => {
      requestBody = docString ?? ''
    })

    When('the URL-encoded request body is normalized for saving', () => {
      try {
        normalizationResult = normalizeSurveyAnswerRequestBody(parseSurvey(surveyInput), requestBody)
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
})
