import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { buildReporterStatistics, parseAnswerFile, parseSurvey } from '../../../src'

const feature = await loadFeature('tests/feature/reporter-statistics.feature')

describeFeature(feature, ({ Scenario }) => {
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

  Scenario('Reporter statistics summarize validated answers per question', ({ Given, And, When, Then }) => {
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

    Then('the respondent count is {int}', (_ctx, count) => {
      expect(statistics?.respondentCount).toBe(count)
    })

    And(
      'single-choice question {string} option {string} has count {int} and percentage {int}',
      (_ctx, questionId, optionId, count, percentage) => {
        const question = statistics?.questions.find((item) => item.id === questionId)

        expect(question?.type).toBe('single-choice')
        if (!question || question.type !== 'single-choice') {
          throw new Error(`Expected single-choice question ${questionId}`)
        }

        expect(question.options.find((option) => option.id === optionId)).toMatchObject({
          count,
          percentage
        })
      }
    )

    And(
      'multi-choice question {string} option {string} has count {int} and percentage {int}',
      (_ctx, questionId, optionId, count, percentage) => {
        const question = statistics?.questions.find((item) => item.id === questionId)

        expect(question?.type).toBe('multi-choice')
        if (!question || question.type !== 'multi-choice') {
          throw new Error(`Expected multi-choice question ${questionId}`)
        }

        expect(question.options.find((option) => option.id === optionId)).toMatchObject({
          count,
          percentage
        })
      }
    )

    And(
      'free-text question {string} answer {string} has count {int} and percentage {int}',
      (_ctx, questionId, answer, count, percentage) => {
        const question = statistics?.questions.find((item) => item.id === questionId)

        expect(question?.type).toBe('free-text')
        if (!question || question.type !== 'free-text') {
          throw new Error(`Expected free-text question ${questionId}`)
        }

        expect(question.answers.find((entry) => entry.value === answer)).toMatchObject({
          count,
          percentage
        })
      }
    )

    And(
      'associative question {string} pair {string} has count {int} and percentage {int}',
      (_ctx, questionId, pairKey, count, percentage) => {
        const question = statistics?.questions.find((item) => item.id === questionId)

        expect(question?.type).toBe('associative')
        if (!question || question.type !== 'associative') {
          throw new Error(`Expected associative question ${questionId}`)
        }

        expect(question.pairs.find((entry) => entry.key === pairKey)).toMatchObject({
          count,
          percentage
        })
      }
    )
  })
})
