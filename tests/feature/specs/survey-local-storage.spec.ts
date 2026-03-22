import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { JSDOM } from 'jsdom'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { generateSurveyHtml, parseSurvey } from '../../../src'

const feature = await loadFeature('tests/feature/survey-local-storage.feature')

describeFeature(feature, ({ Scenario, defineSteps }) => {
  let html = ''
  let pageUrl = ''
  let dom: JSDOM
  let seededStorageRecord:
    | {
        formState: Record<string, unknown>
        updatedAt: number
      }
    | undefined

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }

    return parseYaml(docString) as T
  }

  function createSurveyHtml(): string {
    const survey = parseSurvey({
      title: 'Storage survey',
      sections: {
        basics: {
          title: 'Basics',
          questions: {
            'favorite-color': {
              title: 'Favorite color',
              type: 'single-choice',
              content: {
                red: 'Red',
                blue: 'Blue'
              }
            },
            hobbies: {
              title: 'Hobbies',
              type: 'multi-choice',
              content: {
                music: 'Music',
                sports: 'Sports'
              }
            },
            notes: {
              title: 'Notes',
              type: 'free-text'
            },
            matches: {
              title: 'Associate phrases',
              type: 'associative',
              content: {
                left: {
                  '1': 'Calm'
                },
                right: {
                  A: 'Blue',
                  B: 'Red'
                }
              }
            }
          }
        }
      }
    })

    return generateSurveyHtml(survey, '', {
      surveyName: 'storage-survey',
      formAction: 'https://example.test/cgi-bin/storage-survey/save.cgi'
    })
  }

  function buildStorageRecord(formState: Record<string, unknown>, updatedAt: number): string {
    return JSON.stringify({
      formState,
      updatedAt
    })
  }

  function createDom(input: { storageRecord: string | undefined }): void {
    dom = new JSDOM(html, {
      runScripts: 'dangerously',
      url: pageUrl,
      beforeParse(window) {
        if (input.storageRecord) {
          window.localStorage.setItem(pageUrl, input.storageRecord)
        }
      }
    })
  }

  function dispatchInput(element: HTMLElement): void {
    element.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
    element.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
  }

  function getInput(selector: string): HTMLInputElement {
    const element = dom.window.document.querySelector<HTMLInputElement>(selector)

    if (!element) {
      throw new Error(`Input was not found: ${selector}`)
    }

    return element
  }

  function getTextArea(name: string): HTMLTextAreaElement {
    const element = dom.window.document.querySelector<HTMLTextAreaElement>(`textarea[name="${name}"]`)

    if (!element) {
      throw new Error(`Textarea was not found: ${name}`)
    }

    return element
  }

  function readStoredRecord(): { formState: Record<string, unknown>; updatedAt: number } | undefined {
    const stored = dom.window.localStorage.getItem(pageUrl)

    if (!stored) {
      return undefined
    }

    return JSON.parse(stored) as { formState: Record<string, unknown>; updatedAt: number }
  }

  function readAssociations(questionId: string): Array<{ left: string; right: string }> {
    return JSON.parse(getInput(`input[data-associations-input="${questionId}"]`).value)
  }

  function countStoredLines(): number {
    return dom.window.document.querySelectorAll('[data-stored-line]').length
  }

  function updateSingleChoiceDefault(questionId: string, value: string): void {
    html = html.replace(
      new RegExp(`(<input type="radio" name="${questionId}" value="${value}")`),
      '$1 checked'
    )
  }

  function updateFreeTextDefault(questionId: string, value: string): void {
    html = html.replace(
      new RegExp(`(<textarea name="${questionId}"[^>]*>)(</textarea>)`),
      `$1${value}$2`
    )
  }

  defineSteps(({ Given, When, Then, And }) => {
    Given('generated survey HTML with local-storage coverage at page URL {string}', (_ctx, url) => {
      pageUrl = url
      html = createSurveyHtml()
      seededStorageRecord = undefined
      createDom({ storageRecord: undefined })
    })

    When('I choose single-choice answer {string} for {string}', (_ctx, value, questionId) => {
      const input = getInput(`input[type="radio"][name="${questionId}"][value="${value}"]`)

      input.checked = true
      dispatchInput(input)
    })

    And('I choose multi-choice answer {string} for {string}', (_ctx, value, questionId) => {
      const input = getInput(`input[type="checkbox"][name="${questionId}"][value="${value}"]`)

      input.checked = true
      dispatchInput(input)
    })

    And('I fill free-text answer {string} for {string}', (_ctx, value, questionId) => {
      const textArea = getTextArea(questionId)

      textArea.value = value
      dispatchInput(textArea)
    })

    And('I set associative answer {string} to pair {string} {string}', (_ctx, questionId, left, right) => {
      const input = getInput(`input[data-associations-input="${questionId}"]`)

      input.value = JSON.stringify([{ left, right }])
      dispatchInput(input)
    })

    Then('local survey state is stored for the current page URL', () => {
      const storedRecord = readStoredRecord()

      expect(storedRecord).toBeDefined()
      expect(storedRecord?.formState['favorite-color']).toBe('blue')
      expect(storedRecord?.formState.hobbies).toEqual(['music'])
      expect(storedRecord?.formState.notes).toBe('Remember this answer')
      expect(storedRecord?.formState.matches).toBe('[{"left":"1","right":"A"}]')
      expect(typeof storedRecord?.updatedAt).toBe('number')
    })

    When('I reload the survey page from local storage', () => {
      const storageRecord = dom.window.localStorage.getItem(pageUrl)

      createDom({
        storageRecord: storageRecord ?? undefined
      })
    })

    Then('single-choice answer {string} is restored for {string}', (_ctx, value, questionId) => {
      expect(getInput(`input[type="radio"][name="${questionId}"][value="${value}"]`).checked).toBe(true)
    })

    And('multi-choice answer {string} is restored for {string}', (_ctx, value, questionId) => {
      expect(getInput(`input[type="checkbox"][name="${questionId}"][value="${value}"]`).checked).toBe(true)
    })

    And('free-text answer {string} is restored for {string}', (_ctx, value, questionId) => {
      expect(getTextArea(questionId).value).toBe(value)
    })

    And('associative answer {string} contains pair {string} {string}', (_ctx, questionId, left, right) => {
      expect(readAssociations(questionId)).toEqual([{ left, right }])
    })

    And('{int} stored associative lines are visible', (_ctx, count) => {
      expect(countStoredLines()).toBe(count)
    })

    And('the generated survey HTML defaults single-choice question {string} to {string}', (_ctx, questionId, value) => {
      updateSingleChoiceDefault(questionId, value)
    })

    And('the generated survey HTML defaults free-text question {string} to {string}', (_ctx, questionId, value) => {
      updateFreeTextDefault(questionId, value)
    })

    And('the current page already has local survey state with:', (_ctx, docString) => {
      seededStorageRecord = {
        formState: parseYamlDocString(docString) as Record<string, unknown>,
        updatedAt: Date.now()
      }
    })

    When('I load the survey page with saved local state', () => {
      createDom({
        storageRecord: seededStorageRecord
          ? buildStorageRecord(seededStorageRecord.formState, seededStorageRecord.updatedAt)
          : undefined
      })
    })

    And('I submit the survey form', () => {
      const form = dom.window.document.querySelector('form')

      if (!form) {
        throw new Error('Survey form was not found')
      }

      form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }))
    })

    Then(
      'local survey state still stores single-choice answer {string} for {string}',
      (_ctx, value, questionId) => {
        expect(readStoredRecord()?.formState[questionId]).toBe(value)
      }
    )

    And('the current page has expired local survey state with:', (_ctx, docString) => {
      seededStorageRecord = {
        formState: parseYamlDocString(docString) as Record<string, unknown>,
        updatedAt: Date.now() - 32 * 24 * 60 * 60 * 1000
      }
    })

    Then('no local survey state remains for the current page URL', () => {
      expect(dom.window.localStorage.getItem(pageUrl)).toBeNull()
    })

    And('no single-choice answer is restored for {string}', (_ctx, questionId) => {
      const inputs = dom.window.document.querySelectorAll<HTMLInputElement>(
        `input[type="radio"][name="${questionId}"]`
      )

      expect(Array.from(inputs).some((input) => input.checked)).toBe(false)
    })
  })

  Scenario('Editing a survey stores local state and restores it on reload for the same page URL', () => {})

  Scenario('Local storage overrides survey defaults on page load', () => {})

  Scenario('Submit leaves local survey state intact', () => {})

  Scenario('Expired local survey state is ignored and removed', () => {})
})
