import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'
import { ZodError } from 'zod'

import { parseQuestionnaire } from '../../../src'

const feature = await loadFeature('tests/feature/schema-validation.feature')

describeFeature(feature, ({ Scenario }) => {
  let questionnaireInput: unknown
  let parseResult: unknown
  let parseError: ZodError | null

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }
    return parseYaml(docString) as T
  }

  Scenario('Valid questionnaire content is accepted', ({ Given, When, Then }) => {
    Given('questionnaire content:', (_ctx, docString) => {
      questionnaireInput = parseYamlDocString(docString)
      parseResult = undefined
      parseError = null
    })

    When('the questionnaire content is parsed with the schema', () => {
      try {
        parseResult = parseQuestionnaire(questionnaireInput)
        parseError = null
      } catch (error) {
        parseResult = undefined
        parseError = error as ZodError
      }
    })

    Then('the parsed questionnaire is:', (_ctx, docString) => {
      const expectedOutput = parseYamlDocString<Record<string, unknown>>(docString)

      expect(parseError).toBeNull()
      expect(parseResult).toMatchObject(expectedOutput)
    })
  })

  Scenario('Invalid associative questionnaire content is rejected', ({ Given, When, Then, And }) => {
    Given('questionnaire content:', (_ctx, docString) => {
      questionnaireInput = parseYamlDocString(docString)
      parseResult = undefined
      parseError = null
    })

    When('the questionnaire content is parsed with the schema', () => {
      try {
        parseResult = parseQuestionnaire(questionnaireInput)
        parseError = null
      } catch (error) {
        parseResult = undefined
        parseError = error as ZodError
      }
    })

    Then('the questionnaire content is rejected', () => {
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
})
