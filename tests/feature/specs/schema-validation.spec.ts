import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { ZodError } from 'zod'

import { parseQuestionnaire } from '../../../src/index.js'

const feature = await loadFeature('tests/feature/schema-validation.feature')

describeFeature(feature, ({ Scenario }) => {
  let questionnaireInput: unknown
  let parseResult: unknown
  let parseError: ZodError | null

  Scenario('Valid questionnaire content is accepted', ({ Given, When, Then }) => {
    Given('valid questionnaire content with supported question types', () => {
      questionnaireInput = {
        title: 'Example questionnaire',
        sections: [
          {
            id: 'basics',
            title: 'Basics',
            questions: [
              {
                id: 'favorite-color',
                title: 'Favorite color',
                type: 'single-choice',
                content: {
                  red: 'Red',
                  blue: 'Blue'
                }
              },
              {
                id: 'hobbies',
                title: 'Hobbies',
                type: 'multi-choice',
                content: {
                  music: 'Music',
                  sports: 'Sports'
                }
              },
              {
                id: 'notes',
                title: 'Notes',
                type: 'free-text'
              },
              {
                id: 'matches',
                title: 'Associate phrases',
                type: 'associative',
                content: {
                  left: {
                    '1': 'Calm',
                    '2': 'Precise'
                  },
                  right: {
                    A: 'Blue',
                    B: 'Green'
                  }
                }
              }
            ]
          }
        ]
      }
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

    Then('the questionnaire content is accepted', () => {
      expect(parseError).toBeNull()
      expect(parseResult).toMatchObject({
        title: 'Example questionnaire'
      })
    })
  })

  Scenario('Invalid associative questionnaire content is rejected', ({ Given, When, Then }) => {
    Given('questionnaire content with an associative right-side key that is not a single letter', () => {
      questionnaireInput = {
        title: 'Broken questionnaire',
        sections: [
          {
            id: 'broken',
            title: 'Broken section',
            questions: [
              {
                id: 'invalid-association',
                title: 'Bad association',
                type: 'associative',
                content: {
                  left: {
                    '1': 'First'
                  },
                  right: {
                    AA: 'Too long'
                  }
                }
              }
            ]
          }
        ]
      }
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
      expect(parseError?.issues.some((issue) => issue.message.includes('single letters'))).toBe(true)
    })
  })
})
