import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { renderSaverCgiResponse } from '../../../src'

const feature = await loadFeature('tests/feature/cgi-html-responses.feature')

type SaverResponseParameters = {
  ok?: string
  fail?: string
  css?: string
}

describeFeature(feature, ({ Scenario, defineSteps }) => {
  let saverOutcome: { success: boolean; message?: string }
  let saverResponseParameters: SaverResponseParameters
  let response: {
    statusCode: number
    headers: Record<string, string>
    body: string
  }

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }

    return parseYaml(docString) as T
  }

  function resetResponse(): void {
    response = { statusCode: 0, headers: {}, body: '' }
  }

  function renderResponse(): void {
    response = renderSaverCgiResponse({
      success: saverOutcome.success,
      ...(saverOutcome.message ? { message: saverOutcome.message } : {}),
      ...saverResponseParameters
    })
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
  })

  Scenario('Successful submissions use the built-in success page by default', ({ Given }) => {

    Given('a successful saver outcome', () => {
      saverOutcome = { success: true }
      saverResponseParameters = {}
      resetResponse()
    })
  })

  Scenario('Failed submissions use the built-in failure page by default', ({ Given }) => {
    Given('a failed saver outcome with message {string}', (_ctx, message) => {
      saverOutcome = { success: false, message }
      saverResponseParameters = {}
      resetResponse()
    })
  })

  Scenario('Successful submissions can redirect to a custom success page', ({ Given, And }) => {
    Given('a successful saver outcome', () => {
      saverOutcome = { success: true }
      saverResponseParameters = {}
      resetResponse()
    })

    And('the saver response parameters are:', (_ctx, docString) => {
      saverResponseParameters = parseYamlDocString(docString)
    })

  })

  Scenario('Failed submissions can redirect to a custom failure page', ({ Given, And }) => {
    Given('a failed saver outcome with message {string}', (_ctx, message) => {
      saverOutcome = { success: false, message }
      saverResponseParameters = {}
      resetResponse()
    })

    And('the saver response parameters are:', (_ctx, docString) => {
      saverResponseParameters = parseYamlDocString(docString)
    })

  })

  Scenario('Built-in pages can link a custom stylesheet', ({ Given, And }) => {
    Given('a successful saver outcome', () => {
      saverOutcome = { success: true }
      saverResponseParameters = {}
      resetResponse()
    })

    And('the saver response parameters are:', (_ctx, docString) => {
      saverResponseParameters = parseYamlDocString(docString)
    })

  })
})
