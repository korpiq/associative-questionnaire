import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { generateQuestionnaireHtml, parseQuestionnaire } from '../../../src'

const feature = await loadFeature('tests/feature/generate-questionnaire-page.feature')

describeFeature(feature, ({ Scenario }) => {
  let questionnaireInput: unknown
  let templateInput = ''
  let generatedHtml = ''

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }
    return parseYaml(docString) as T
  }

  Scenario(
    'Generate a standalone page with one section and all supported question types',
    ({ Given, And, When, Then }) => {
      Given('questionnaire content:', (_ctx, docString) => {
        questionnaireInput = parseYamlDocString(docString)
        generatedHtml = ''
      })

      And('HTML template:', (_ctx, docString) => {
        templateInput = docString ?? ''
      })

      When('the questionnaire HTML page is generated', () => {
        const questionnaire = parseQuestionnaire(questionnaireInput)
        generatedHtml = generateQuestionnaireHtml(questionnaire, templateInput)
      })

      Then('the result is a standalone HTML page', () => {
        expect(generatedHtml).toContain('<!DOCTYPE html>')
        expect(generatedHtml).toContain('<html>')
        expect(generatedHtml).toContain('<style>')
        expect(generatedHtml).toContain('<script>')
        expect(generatedHtml).toContain('<form>')
      })

      And('the result contains the questionnaire title {string}', (_ctx, title) => {
        expect(generatedHtml).toContain(title)
      })

      And('the result contains the questionnaire description {string}', (_ctx, description) => {
        expect(generatedHtml).toContain(description)
      })

      And('the result contains the section title {string}', (_ctx, title) => {
        expect(generatedHtml).toContain(title)
      })

      And('the result contains the section description {string}', (_ctx, description) => {
        expect(generatedHtml).toContain(description)
      })

      And('the result contains the single-choice question title {string}', (_ctx, title) => {
        expect(generatedHtml).toContain(title)
      })

      And('the result contains the multi-choice question title {string}', (_ctx, title) => {
        expect(generatedHtml).toContain(title)
      })

      And('the result contains the free-text question title {string}', (_ctx, title) => {
        expect(generatedHtml).toContain(title)
      })

      And('the result contains the associative question title {string}', (_ctx, title) => {
        expect(generatedHtml).toContain(title)
      })

      And('the result contains the associative left phrase {string}', (_ctx, phrase) => {
        expect(generatedHtml).toContain(phrase)
      })

      And('the result contains the associative right phrase {string}', (_ctx, phrase) => {
        expect(generatedHtml).toContain(phrase)
      })
    }
  )
})
