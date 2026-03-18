import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'

import { parseDeploymentPath } from '../../../src'

const feature = await loadFeature('tests/feature/deployment-path-splitting.feature')

describeFeature(feature, ({ Scenario }) => {
  let configuredPath = ''
  let parsedPath:
    | {
        existingRoot: string
        createableSubpath: string
        fullPath: string
      }
    | undefined
  let parseError: Error | null = null

  function resetState(): void {
    configuredPath = ''
    parsedPath = undefined
    parseError = null
  }

  function parseConfiguredPath(): void {
    try {
      parsedPath = parseDeploymentPath(configuredPath)
      parseError = null
    } catch (error) {
      parsedPath = undefined
      parseError = error as Error
    }
  }

  Scenario(
    'A path with /./ separates an existing root from a deploy-created subpath',
    ({ Given, When, Then, And }) => {
      Given('the configured deployment path is {string}', (_ctx, value) => {
        resetState()
        configuredPath = value
      })

      When('the deployment path is parsed', () => {
        parseConfiguredPath()
      })

      Then('the parsed existing root is {string}', (_ctx, value) => {
        expect(parseError).toBeNull()
        expect(parsedPath?.existingRoot).toBe(value)
      })

      And('the parsed createable subpath is {string}', (_ctx, value) => {
        expect(parseError).toBeNull()
        expect(parsedPath?.createableSubpath).toBe(value)
      })

      And('the parsed full deployment path is {string}', (_ctx, value) => {
        expect(parseError).toBeNull()
        expect(parsedPath?.fullPath).toBe(value)
      })
    }
  )

  Scenario('A path without /./ is treated as fully pre-existing', ({ Given, When, Then, And }) => {
    Given('the configured deployment path is {string}', (_ctx, value) => {
      resetState()
      configuredPath = value
    })

    When('the deployment path is parsed', () => {
      parseConfiguredPath()
    })

    Then('the parsed existing root is {string}', (_ctx, value) => {
      expect(parseError).toBeNull()
      expect(parsedPath?.existingRoot).toBe(value)
    })

    And('the parsed createable subpath is empty', () => {
      expect(parseError).toBeNull()
      expect(parsedPath?.createableSubpath).toBe('')
    })

    And('the parsed full deployment path is {string}', (_ctx, value) => {
      expect(parseError).toBeNull()
      expect(parsedPath?.fullPath).toBe(value)
    })
  })

  Scenario('A path with more than one /./ is rejected', ({ Given, When, Then }) => {
    Given('the configured deployment path is {string}', (_ctx, value) => {
      resetState()
      configuredPath = value
    })

    When('the deployment path is parsed', () => {
      parseConfiguredPath()
    })

    Then('the deployment path is rejected with {string}', (_ctx, message) => {
      expect(parsedPath).toBeUndefined()
      expect(parseError?.message).toBe(message)
    })
  })

  Scenario('A path with /./ but no createable subpath is rejected', ({ Given, When, Then }) => {
    Given('the configured deployment path is {string}', (_ctx, value) => {
      resetState()
      configuredPath = value
    })

    When('the deployment path is parsed', () => {
      parseConfiguredPath()
    })

    Then('the deployment path is rejected with {string}', (_ctx, message) => {
      expect(parsedPath).toBeUndefined()
      expect(parseError?.message).toBe(message)
    })
  })
})
