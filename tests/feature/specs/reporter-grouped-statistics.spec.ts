import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { buildReporterStatistics, parseAnswerFile, parseSurvey } from '../../../src'

const feature = await loadFeature('tests/feature/reporter-grouped-statistics.feature')

describeFeature(feature, ({ Scenario, defineSteps }) => {
  let surveyInput: unknown
  let answerFilesInput: unknown[]
  let groupBy: string[]
  let recipientCount: number | undefined
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
    const assertGroupedResult = (
      key: string,
      respondentCount: number,
      recipientPercentage: number
    ): void => {
      const result = statistics?.groupedResults?.find((entry) => entry.key === key)

      expect(result).toMatchObject({
        respondentCount,
        recipientPercentage
      })
    }

    Then(
      'grouped result {string} has respondent count {int} and recipient percentage {int}',
      (_ctx, key, respondentCount, recipientPercentage) => {
        assertGroupedResult(key, respondentCount, recipientPercentage)
      }
    )

    And(
      'grouped result {string} has respondent count {int} and recipient percentage {int}',
      (_ctx, key, respondentCount, recipientPercentage) => {
        assertGroupedResult(key, respondentCount, recipientPercentage)
      }
    )
  })

  Scenario('Reporter statistics can group respondents by selected question identifiers', ({ Given, And, When }) => {
    Given('survey content:', (_ctx, docString) => {
      surveyInput = parseYamlDocString(docString)
      answerFilesInput = []
      groupBy = []
      recipientCount = undefined
      statistics = undefined
    })

    And('saved answer files are:', (_ctx, docString) => {
      answerFilesInput = parseYamlDocString(docString)
    })

    And('reporter statistics are grouped by question identifiers:', (_ctx, docString) => {
      groupBy = parseYamlDocString(docString)
    })

    And('the recipient count is {int}', (_ctx, count) => {
      recipientCount = count
    })

    When('reporter statistics are computed', () => {
      statistics = buildReporterStatistics(
        parseSurvey(surveyInput),
        answerFilesInput.map((answerFile) => parseAnswerFile(answerFile)),
        {
          groupBy,
          ...(recipientCount !== undefined ? { recipientCount } : {})
        }
      )
    })
  })
})
