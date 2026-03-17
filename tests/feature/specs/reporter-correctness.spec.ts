import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { buildReporterStatistics, parseAnswerFile, parseSurvey } from '../../../src'

const feature = await loadFeature('tests/feature/reporter-correctness.feature')

describeFeature(feature, ({ Scenario, defineSteps }) => {
  let surveyInput: unknown
  let answerFilesInput: unknown[]
  let statistics:
    | ReturnType<typeof buildReporterStatistics>
    | undefined

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }

    return parseYaml(docString) as T
  }

  defineSteps(({ Then, And }) => {
    const assertCorrectness = (
      questionId: string,
      correctCount: number,
      incorrectCount: number,
      correctPercentage: number
    ): void => {
      const question = statistics?.questions.find((item) => item.id === questionId)

      expect(question?.correctness).toMatchObject({
        correctCount,
        incorrectCount,
        correctPercentage
      })
    }

    Then(
      'question {string} has correct {int} incorrect {int} correct percentage {int}',
      (_ctx, questionId, correctCount, incorrectCount, correctPercentage) => {
        assertCorrectness(questionId, correctCount, incorrectCount, correctPercentage)
      }
    )

    And(
      'question {string} has correct {int} incorrect {int} correct percentage {int}',
      (_ctx, questionId, correctCount, incorrectCount, correctPercentage) => {
        assertCorrectness(questionId, correctCount, incorrectCount, correctPercentage)
      }
    )

    And('question {string} has no correctness statistics', (_ctx, questionId) => {
      const question = statistics?.questions.find((item) => item.id === questionId)

      expect(question?.correctness).toBeUndefined()
    })
  })

  Scenario('Correctness counts are reported only for questions that define correct answers', ({ Given, And, When }) => {
    Given('survey content:', (_ctx, docString) => {
      surveyInput = parseYamlDocString(docString)
      answerFilesInput = []
      statistics = undefined
    })

    And('saved answer files are:', (_ctx, docString) => {
      answerFilesInput = parseYamlDocString(docString)
    })

    When('reporter statistics are computed', () => {
      statistics = buildReporterStatistics(
        parseSurvey(surveyInput),
        answerFilesInput.map((answerFile) => parseAnswerFile(answerFile))
      )
    })
  })
})
