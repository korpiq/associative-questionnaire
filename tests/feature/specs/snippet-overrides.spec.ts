import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { generateSurveyHtml, parseSurvey } from '../../../src'

const feature = await loadFeature('tests/feature/snippet-overrides.feature')

describeFeature(feature, ({ Scenario }) => {
  let surveyInput: unknown
  let templateInput = ''
  let generatedHtml = ''

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }
    return parseYaml(docString) as T
  }

  Scenario('Template overrides replace default snippets', ({ Given, And, When, Then }) => {
    Given('survey content:', (_ctx, docString) => {
      surveyInput = parseYamlDocString(docString)
      generatedHtml = ''
    })

    And('HTML template:', (_ctx, docString) => {
      templateInput = docString ?? ''
    })

    When('the survey HTML page is generated', () => {
      const survey = parseSurvey(surveyInput)
      generatedHtml = generateSurveyHtml(survey, templateInput)
    })

    Then('the result contains the section title override {string}', (_ctx, expected) => {
      expect(generatedHtml).toContain(expected)
    })

    And('the result contains the question title override {string}', (_ctx, expected) => {
      expect(generatedHtml).toContain(expected)
    })

    And('the result contains the style override {string}', (_ctx, expected) => {
      expect(generatedHtml).toContain(expected)
    })

    And('the result contains the script override {string}', (_ctx, expected) => {
      expect(generatedHtml).toContain(expected)
    })
  })
})
