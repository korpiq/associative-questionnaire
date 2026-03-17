import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { deriveRespondentAnswerFilename } from '../../../src'

const feature = await loadFeature('tests/feature/cgi-respondent-filename.feature')

type CgiRequestHeaders = Record<string, string | undefined>

describeFeature(feature, ({ Scenario }) => {
  let headersInput: CgiRequestHeaders
  let deploymentSalt = ''
  let filename = ''

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }

    return parseYaml(docString) as T
  }

  Scenario('The respondent filename is hashed from request headers', ({ Given, When, Then }) => {
    Given('the CGI request headers are:', (_ctx, docString) => {
      headersInput = parseYamlDocString(docString)
      deploymentSalt = ''
      filename = ''
    })

    When('the respondent filename is derived', () => {
      filename = deriveRespondentAnswerFilename(headersInput)
    })

    Then('the respondent filename is {string}', (_ctx, expectedFilename) => {
      expect(filename).toBe(expectedFilename)
    })
  })

  Scenario('The respondent filename hash can include a deployment salt', ({ Given, And, When, Then }) => {
    Given('the CGI request headers are:', (_ctx, docString) => {
      headersInput = parseYamlDocString(docString)
      deploymentSalt = ''
      filename = ''
    })

    And('the deployment salt is {string}', (_ctx, salt) => {
      deploymentSalt = salt
    })

    When('the respondent filename is derived', () => {
      filename = deriveRespondentAnswerFilename(headersInput, deploymentSalt)
    })

    Then('the respondent filename is {string}', (_ctx, expectedFilename) => {
      expect(filename).toBe(expectedFilename)
    })
  })
})
