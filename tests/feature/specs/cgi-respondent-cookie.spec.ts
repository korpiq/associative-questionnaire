import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'

import { resolveRespondentCookie } from '../../../src'

const feature = await loadFeature('tests/feature/cgi-respondent-cookie.feature')

describeFeature(feature, ({ Scenario, defineSteps }) => {
  let cookieHeader: string | undefined
  let respondent: ReturnType<typeof resolveRespondentCookie>

  function resetRespondent(): void {
    respondent = { respondentId: '' }
  }

  defineSteps(({ And }) => {
    And('the Set-Cookie header contains {string}', (_ctx, fragment) => {
      expect(respondent.setCookieHeader).toContain(fragment)
    })
  })

  Scenario('Existing respondent cookie is reused', ({ Given, When, Then, And }) => {
    Given('the CGI cookie header is {string}', (_ctx, value) => {
      cookieHeader = value
      resetRespondent()
    })

    When('the saver respondent cookie is resolved', () => {
      respondent = resolveRespondentCookie(cookieHeader)
    })

    Then('the respondent id is {string}', (_ctx, respondentId) => {
      expect(respondent.respondentId).toBe(respondentId)
    })

    And('no Set-Cookie header is required', () => {
      expect(respondent.setCookieHeader).toBeUndefined()
    })
  })

  Scenario('Missing respondent cookie creates a new month-long cookie', ({ Given, When, Then }) => {
    Given('no CGI cookie header', () => {
      cookieHeader = undefined
      resetRespondent()
    })

    When('the saver respondent cookie is resolved', () => {
      respondent = resolveRespondentCookie(cookieHeader)
    })

    Then('a new respondent id is generated', () => {
      expect(respondent.respondentId).toMatch(/^[a-f0-9]{32}$/)
    })
  })
})
