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

  function setRect(
    element: Element,
    rect: { left: number; top: number; width: number; height: number }
  ): void {
    Object.defineProperty(element, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        right: rect.left + rect.width,
        bottom: rect.top + rect.height,
        x: rect.left,
        y: rect.top,
        toJSON: () => rect
      })
    })
  }

  function getLiveLine(): SVGLineElement {
    const line = dom.window.document.querySelector<SVGLineElement>('[data-live-line]')

    if (!line) {
      throw new Error('Live line was not found')
    }

    return line
  }

  defineSteps(({ Given, When, Then, And }) => {
    Given('generated questionnaire HTML with one associative question and fixed phrase positions', () => {
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

      const root = dom.window.document.querySelector('.associative-groups')
      const left = getPhrase('left', '1')
      const right = getPhrase('right', 'A')
      const leftHandle = left.querySelector('.phrase-handle-right')
      const rightHandle = right.querySelector('.phrase-handle-left')

      if (!root || !leftHandle || !rightHandle) {
        throw new Error('Associative root was not found')
      }

      setRect(root, { left: 0, top: 0, width: 900, height: 240 })
      setRect(left, { left: 40, top: 60, width: 120, height: 40 })
      setRect(right, { left: 740, top: 60, width: 120, height: 40 })
      setRect(leftHandle, { left: 153, top: 73, width: 14, height: 14 })
      setRect(rightHandle, { left: 733, top: 73, width: 14, height: 14 })
    })

    When('left phrase {string} starts dragging to point {int} {int}', (_ctx, leftId, x, y) => {
      const left = getPhrase('left', leftId)

      left.dispatchEvent(
        new dom.window.MouseEvent('mousedown', {
          bubbles: true,
          clientX: 100,
          clientY: 80
        })
      )
      dom.window.document.dispatchEvent(
        new dom.window.MouseEvent('mousemove', {
          bubbles: true,
          clientX: x,
          clientY: y
        })
      )
    })

    Then(
      'the live associative line starts at left phrase {string} and ends at point {int} {int}',
      (_ctx, leftId, x, y) => {
        const line = getLiveLine()

        expect(line.hasAttribute('hidden')).toBe(false)
        expect(line.getAttribute('x1')).toBe('160')
        expect(line.getAttribute('y1')).toBe('80')
        expect(line.getAttribute('x2')).toBe(String(x))
        expect(line.getAttribute('y2')).toBe(String(y))
        expect(getPhrase('left', leftId).classList.contains('is-pending')).toBe(true)
      }
    )

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

    And('{int} stored associative lines are visible', (_ctx, expectedCount) => {
      expect(dom.window.document.querySelectorAll('[data-stored-line]')).toHaveLength(expectedCount)
    })

    And('the live associative line is hidden', () => {
      const line = getLiveLine()

      expect(line.hasAttribute('hidden')).toBe(true)
      expect(line.style.display).toBe('none')
    })

    And('the live associative line is hidden after the link is undone', () => {
      const line = getLiveLine()

      expect(line.hasAttribute('hidden')).toBe(true)
      expect(line.style.display).toBe('none')
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
