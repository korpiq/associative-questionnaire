import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { resolveCgiScriptRuntimePaths } from '../../../src'

const feature = await loadFeature('tests/feature/cgi-runtime-path-resolution.feature')

describeFeature(feature, ({ Scenario }) => {
  let scriptFilename = ''
  let privateSurveyRelativePath = ''
  let privateAnswersRelativePath = ''
  let resolvedPaths: ReturnType<typeof resolveCgiScriptRuntimePaths> | null = null
  let resolutionError: Error | null = null

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }

    return parseYaml(docString) as T
  }

  Scenario('Runtime survey paths are resolved from the CGI script directory', ({ Given, And, When, Then }) => {
    Given('the CGI script filename is:', (_ctx, docString) => {
      scriptFilename = docString ?? ''
      privateSurveyRelativePath = ''
      privateAnswersRelativePath = ''
      resolvedPaths = null
      resolutionError = null
    })

    And('the private survey relative path is:', (_ctx, docString) => {
      privateSurveyRelativePath = (docString ?? '').trim()
    })

    And('the private answers relative path is:', (_ctx, docString) => {
      privateAnswersRelativePath = (docString ?? '').trim()
    })

    When('the CGI runtime paths are resolved', () => {
      try {
        resolvedPaths = resolveCgiScriptRuntimePaths(
          scriptFilename.trim(),
          privateSurveyRelativePath,
          privateAnswersRelativePath
        )
        resolutionError = null
      } catch (error) {
        resolvedPaths = null
        resolutionError = error as Error
      }
    })

    Then('the resolved CGI runtime paths are:', (_ctx, docString) => {
      expect(resolutionError).toBeNull()
      expect(resolvedPaths).toEqual(parseYamlDocString(docString))
    })
  })

  Scenario('Missing CGI script filename is rejected', ({ Given, And, When, Then }) => {
    Given('the CGI script filename is:', (_ctx, docString) => {
      scriptFilename = docString ?? ''
      privateSurveyRelativePath = ''
      privateAnswersRelativePath = ''
      resolvedPaths = null
      resolutionError = null
    })

    And('the private survey relative path is:', (_ctx, docString) => {
      privateSurveyRelativePath = (docString ?? '').trim()
    })

    And('the private answers relative path is:', (_ctx, docString) => {
      privateAnswersRelativePath = (docString ?? '').trim()
    })

    When('the CGI runtime paths are resolved', () => {
      try {
        resolvedPaths = resolveCgiScriptRuntimePaths(
          scriptFilename.trim(),
          privateSurveyRelativePath,
          privateAnswersRelativePath
        )
        resolutionError = null
      } catch (error) {
        resolvedPaths = null
        resolutionError = error as Error
      }
    })

    Then('the CGI runtime path resolution fails with:', (_ctx, docString) => {
      expect(resolvedPaths).toBeNull()
      expect(resolutionError?.message).toBe(docString?.trim())
    })
  })
})
