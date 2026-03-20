import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'
import { ZodError } from 'zod'

import { parseSurvey } from '../../../src'

const feature = await loadFeature('tests/feature/schema-validation.feature')

describeFeature(feature, ({ Scenario, defineSteps }) => {
  let surveyInput: unknown
  let parseResult: unknown
  let parseError: ZodError | null

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }

    return parseYaml(docString) as T
  }

  defineSteps(({ Given, When, Then, And }) => {
    Given('survey content:', (_ctx, docString) => {
      surveyInput = parseYamlDocString(docString)
      parseResult = undefined
      parseError = null
    })

    When('the survey content is parsed with the schema', () => {
      try {
        parseResult = parseSurvey(surveyInput)
        parseError = null
      } catch (error) {
        parseResult = undefined
        parseError = error as ZodError
      }
    })

    Then('the parsed survey is:', (_ctx, docString) => {
      const expectedOutput = parseYamlDocString<Record<string, unknown>>(docString)

      expect(parseError).toBeNull()
      expect(parseResult).toMatchObject(expectedOutput)
    })

    Then('the parsed survey exactly is:', (_ctx, docString) => {
      const expectedOutput = parseYamlDocString<Record<string, unknown>>(docString)

      expect(parseError).toBeNull()
      expect(parseResult).toEqual(expectedOutput)
    })

    Then('the survey content is rejected', () => {
      expect(parseResult).toBeUndefined()
      expect(parseError).toBeInstanceOf(ZodError)
    })

    And('the schema issues are:', (_ctx, docString) => {
      const expectedIssues = parseYamlDocString<
        Array<{ path: Array<string | number>; message: string }>
      >(docString)
      const actualIssues =
        parseError?.issues.map((issue) => ({
          path: issue.path,
          message: issue.message
        })) ?? []

      expect(actualIssues).toEqual(expectedIssues)
    })
  })

  Scenario('Valid survey content is accepted', () => {})

  Scenario('Invalid associative survey content is rejected', () => {})

  Scenario('Legacy survey-level protected metadata is ignored', () => {})

  Scenario('Invalid correct answers are rejected', () => {})
})
