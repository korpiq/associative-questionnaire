import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { normalizeSurvey, parseSurvey } from '../../../src'

const feature = await loadFeature('tests/feature/normalize-survey.feature')

describeFeature(feature, ({ Scenario }) => {
  let surveyInput: unknown
  let normalizedSurvey: ReturnType<typeof normalizeSurvey> | undefined

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }

    return parseYaml(docString) as T
  }

  Scenario('Keyed survey sections and questions keep source order and key-derived ids', ({ Given, When, Then }) => {
    Given('survey content for normalization:', (_ctx, docString) => {
      surveyInput = parseYamlDocString(docString)
      normalizedSurvey = undefined
    })

    When('the survey is normalized', () => {
      normalizedSurvey = normalizeSurvey(parseSurvey(surveyInput as Record<string, unknown>))
    })

    Then('the normalized survey matches:', (_ctx, docString) => {
      expect(normalizedSurvey).toMatchObject(parseYamlDocString<Record<string, unknown>>(docString))
    })
  })
})
