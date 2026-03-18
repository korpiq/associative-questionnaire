import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import {
  buildReporterStatistics,
  parseAnswerFile,
  parseSurvey,
  renderReporterHtmlPage
} from '../../../src'

const feature = await loadFeature('tests/feature/reporter-html-output.feature')

describeFeature(feature, ({ Scenario, defineSteps }) => {
  let surveyInput: unknown
  let answerFilesInput: unknown[]
  let renderedHtml = ''

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }

    return parseYaml(docString) as T
  }

  defineSteps(({ Then, And }) => {
    const assertContains = (text: string): void => {
      expect(renderedHtml).toContain(text)
    }

    Then('the reporter HTML page contains {string}', (_ctx, text) => {
      assertContains(text)
    })

    And('the reporter HTML page contains {string}', (_ctx, text) => {
      assertContains(text)
    })
  })

  Scenario('Reporter HTML page shows the survey title, totals, and per-question statistics', ({ Given, And, When }) => {
    Given('survey content:', (_ctx, docString) => {
      surveyInput = parseYamlDocString(docString)
      answerFilesInput = []
      renderedHtml = ''
    })

    And('saved answer files are:', (_ctx, docString) => {
      answerFilesInput = parseYamlDocString(docString)
    })

    When('the reporter HTML page is rendered for {string}', (_ctx, surveyName) => {
      const survey = parseSurvey(surveyInput)
      const statistics = buildReporterStatistics(
        survey,
        answerFilesInput.map((answerFile) => parseAnswerFile(answerFile))
      )

      renderedHtml = renderReporterHtmlPage({
        surveyName,
        survey,
        statistics
      })
    })
  })
})
