import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { JSDOM } from 'jsdom'
import { expect } from 'vitest'

import { generateQuestionnaireHtml, parseQuestionnaire } from '../../../src'

const feature = await loadFeature('tests/feature/association-linker.feature')

describeFeature(feature, ({ Scenario, defineSteps }) => {
  let dom: JSDOM

  function readAnswer(questionId: string): Array<{ left: string; right: string }> {
    const input = dom.window.document.querySelector<HTMLInputElement>(
      `input[data-associations-input="${questionId}"]`
    )

    if (!input) {
      throw new Error(`Association input for "${questionId}" was not found`)
    }

    return JSON.parse(input.value)
  }

  function getPhrase(side: 'left' | 'right', phraseId: string): HTMLElement {
    const phrase = dom.window.document.querySelector<HTMLElement>(
      `.phrase[data-side="${side}"][data-phrase-id="${phraseId}"]`
    )

    if (!phrase) {
      throw new Error(`Phrase "${phraseId}" on side "${side}" was not found`)
    }

    return phrase
  }

  defineSteps(({ Given, When, Then }) => {
    Given('generated questionnaire HTML with one associative question', () => {
      const questionnaire = parseQuestionnaire({
        title: 'Association example',
        sections: {
          basics: {
            title: 'Basics',
            questions: {
              matches: {
                title: 'Associate phrases',
                type: 'associative',
                content: {
                  left: {
                    '1': 'Calm'
                  },
                  right: {
                    A: 'Blue'
                  }
                }
              }
            }
          }
        }
      })
      const html = generateQuestionnaireHtml(questionnaire, '')

      dom = new JSDOM(html, {
        runScripts: 'dangerously'
      })
    })
    When('left phrase {string} is dragged to right phrase {string}', (_ctx, leftId, rightId) => {
      const left = getPhrase('left', leftId)
      const right = getPhrase('right', rightId)

      left.dispatchEvent(new dom.window.MouseEvent('mousedown', { bubbles: true }))
      right.dispatchEvent(new dom.window.MouseEvent('mouseenter', { bubbles: true }))
      right.dispatchEvent(new dom.window.MouseEvent('mouseup', { bubbles: true }))
    })

    When('left phrase {string} is dragged again to right phrase {string}', (_ctx, leftId, rightId) => {
      const left = getPhrase('left', leftId)
      const right = getPhrase('right', rightId)

      left.dispatchEvent(new dom.window.MouseEvent('mousedown', { bubbles: true }))
      right.dispatchEvent(new dom.window.MouseEvent('mouseenter', { bubbles: true }))
      right.dispatchEvent(new dom.window.MouseEvent('mouseup', { bubbles: true }))
    })

    Then('associative answer {string} contains pair {string} {string}', (_ctx, questionId, leftId, rightId) => {
      expect(readAnswer(questionId)).toContainEqual({
        left: leftId,
        right: rightId
      })
    })

    Then('associative answer {string} is empty', (_ctx, questionId) => {
      expect(readAnswer(questionId)).toEqual([])
    })

    When('left phrase {string} is focused and key {string} is pressed', (_ctx, leftId, key) => {
      const left = getPhrase('left', leftId)

      left.focus()
      left.dispatchEvent(
        new dom.window.KeyboardEvent('keydown', {
          bubbles: true,
          key
        })
      )
    })
  })

  Scenario('Dragging from one phrase to another toggles an association', () => {})

  Scenario('Keyboard linking toggles an association', () => {})
})
