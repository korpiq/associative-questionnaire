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
  function resetState(): void {
    configuredPath = ''
    parsedPath = undefined
  }

  function parseConfiguredPath(): void {
    parsedPath = parseDeploymentPath(configuredPath)
  }

  Scenario(
    'A path containing /./ is treated as a plain path',
    ({ Given, When, Then, And }) => {
      Given('the configured deployment path is {string}', (_ctx, value) => {
        resetState()
        configuredPath = value
      })

      When('the deployment path is parsed', () => {
        parseConfiguredPath()
      })

      Then('the parsed existing root is {string}', (_ctx, value) => {
        expect(parsedPath?.existingRoot).toBe(value)
      })

      And('the parsed createable subpath is empty', () => {
        expect(parsedPath?.createableSubpath).toBe('')
      })

      And('the parsed full deployment path is {string}', (_ctx, value) => {
        expect(parsedPath?.fullPath).toBe(value)
      })
    }
  )

  Scenario('A path without /./ is also treated as a plain path', ({ Given, When, Then, And }) => {
    Given('the configured deployment path is {string}', (_ctx, value) => {
      resetState()
      configuredPath = value
    })

      When('the deployment path is parsed', () => {
        parseConfiguredPath()
      })

      Then('the parsed existing root is {string}', (_ctx, value) => {
        expect(parsedPath?.existingRoot).toBe(value)
      })

      And('the parsed createable subpath is empty', () => {
        expect(parsedPath?.createableSubpath).toBe('')
      })

      And('the parsed full deployment path is {string}', (_ctx, value) => {
        expect(parsedPath?.fullPath).toBe(value)
      })
    })
})
