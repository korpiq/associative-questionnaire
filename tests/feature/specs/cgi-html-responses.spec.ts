import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { renderSaverCgiResponse } from '../../../src'

const feature = await loadFeature('tests/feature/cgi-html-responses.feature')

type SaverResponseParameters = {
  ok?: string
  fail?: string
  css?: string
  setCookieHeader?: string
}

describeFeature(feature, ({ Scenario, defineSteps }) => {
  let saverOutcome: { success: boolean; message?: string }
  let saverResponseParameters: SaverResponseParameters
  let response: {
    statusCode: number
    headers: Record<string, string>
    body: string
  }
  let renderingError: Error | null = null

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }

    return parseYaml(docString) as T
  }

  function resetResponse(): void {
    response = { statusCode: 0, headers: {}, body: '' }
    renderingError = null
  }

  function renderResponse(): void {
    try {
      response = renderSaverCgiResponse({
        success: saverOutcome.success,
        ...(saverOutcome.message ? { message: saverOutcome.message } : {}),
        ...saverResponseParameters
      })
      renderingError = null
    } catch (error) {
      renderingError = error instanceof Error ? error : new Error(String(error))
      response = { statusCode: 0, headers: {}, body: '' }
    }
  }

  defineSteps(({ Then, And, When }) => {
    When('the saver CGI response is rendered', () => {
      renderResponse()
    })

    Then('the CGI response status code is {int}', (_ctx, statusCode) => {
      expect(response.statusCode).toBe(statusCode)
    })

    And('the CGI response content type is {string}', (_ctx, contentType) => {
      expect(response.headers['Content-Type']).toBe(contentType)
    })

    And('the CGI response body contains {string}', (_ctx, text) => {
      expect(response.body).toContain(text)
    })

    And('the CGI response body contains:', (_ctx, docString) => {
      expect(response.body).toContain(docString ?? '')
    })

    And('the CGI response header {string} is {string}', (_ctx, headerName, headerValue) => {
      expect(response.headers[headerName]).toBe(headerValue)
    })

    And('the CGI response body is empty', () => {
      expect(response.body).toBe('')
    })

    Then('rendering the saver CGI response is rejected with {string}', (_ctx, message) => {
      expect(renderingError?.message).toBe(message)
    })
  })

  Scenario('Success redirect sets the respondent cookie', ({ Given, And }) => {
    Given('a successful saver outcome', () => {
      saverOutcome = { success: true }
      saverResponseParameters = {}
      resetResponse()
    })

    And('the saver response parameters are:', (_ctx, docString) => {
      saverResponseParameters = parseYamlDocString(docString)
    })
  })

  Scenario('Success redirect', ({ Given, And }) => {
    Given('a successful saver outcome', () => {
      saverOutcome = { success: true }
      saverResponseParameters = {}
      resetResponse()
    })

    And('the saver response parameters are:', (_ctx, docString) => {
      saverResponseParameters = parseYamlDocString(docString)
    })

  })

  Scenario('Failure redirect', ({ Given, And }) => {
    Given('a failed saver outcome with message {string}', (_ctx, message) => {
      saverOutcome = { success: false, message }
      saverResponseParameters = {}
      resetResponse()
    })

    And('the saver response parameters are:', (_ctx, docString) => {
      saverResponseParameters = parseYamlDocString(docString)
    })

  })

  Scenario('Missing success redirect is rejected', ({ Given }) => {
    Given('a successful saver outcome', () => {
      saverOutcome = { success: true }
      saverResponseParameters = {}
      resetResponse()
    })
  })

  Scenario('Missing failure redirect is rejected', ({ Given }) => {
    Given('a failed saver outcome with message {string}', (_ctx, message) => {
      saverOutcome = { success: false, message }
      saverResponseParameters = {}
      resetResponse()
    })
  })
})
