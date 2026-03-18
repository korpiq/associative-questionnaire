import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { deriveSurveyName, generateSurveyHtml, parseSurvey } from '../../../src'

const feature = await loadFeature('tests/feature/generate-survey-page.feature')

describeFeature(feature, ({ Scenario, defineSteps }) => {
  let surveyInput: unknown
  let surveyPath = ''
  let formAction = ''
  let templateInput = ''
  let generatedHtml = ''

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }
    return parseYaml(docString) as T
  }

  defineSteps(({ Given, And, When, Then }) => {
    Given('survey content:', (_ctx, docString) => {
      surveyInput = parseYamlDocString(docString)
      surveyPath = ''
      formAction = ''
      templateInput = ''
      generatedHtml = ''
    })

    And('the survey file path is {string}', (_ctx, inputPath) => {
      surveyPath = inputPath
    })

    And('the form action URL is {string}', (_ctx, actionUrl) => {
      formAction = actionUrl
    })

    And('HTML template:', (_ctx, docString) => {
      templateInput = docString ?? ''
    })

    When('the survey HTML page is generated', () => {
      const survey = parseSurvey(surveyInput)
      generatedHtml = generateSurveyHtml(survey, templateInput, {
        surveyName: deriveSurveyName(surveyPath),
        formAction
      })
    })

    Then('the result is a standalone HTML page', () => {
      expect(generatedHtml).toContain('<!DOCTYPE html>')
      expect(generatedHtml).toContain('<html')
      expect(generatedHtml).toContain('<style>')
      expect(generatedHtml).toContain('<script>')
      expect(generatedHtml).toContain('<form')
    })

    And('the result contains the survey title {string}', (_ctx, title) => {
      expect(generatedHtml).toContain(title)
    })

    And('the result contains the survey description {string}', (_ctx, description) => {
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

    And('the result contains the shell class {string}', (_ctx, className) => {
      expect(generatedHtml).toContain(`class="${className}"`)
    })

    And('the result contains the section class {string}', (_ctx, className) => {
      expect(generatedHtml).toContain(`class="${className}"`)
    })

    And('the result contains the question class {string}', (_ctx, className) => {
      expect(generatedHtml).toContain(`class="${className}"`)
    })

    And('the result posts to {string}', (_ctx, actionUrl) => {
      expect(generatedHtml).toContain(`action="${actionUrl}"`)
    })

    And('the result uses method {string}', (_ctx, method) => {
      expect(generatedHtml).toContain(`method="${method}"`)
    })

    Then('the result exposes the survey name {string}', (_ctx, surveyName) => {
      expect(generatedHtml).toContain(`data-survey-name="${surveyName}"`)
    })

    And('the result exposes the survey name {string}', (_ctx, surveyName) => {
      expect(generatedHtml).toContain(`data-survey-name="${surveyName}"`)
    })

    And('the result contains the submit button text {string}', (_ctx, label) => {
      expect(generatedHtml).toContain(label)
    })
  })

  Scenario('Standalone page renders all supported question content', () => {})

  Scenario('Generated page uses native POST form submission', () => {})

  Scenario('Generated page exposes the derived survey name', () => {})
})
