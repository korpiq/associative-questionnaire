import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { parseDeploymentTargetConfig } from '../../../src'

const feature = await loadFeature('tests/feature/deployment-target-config.feature')

describeFeature(feature, ({ Scenario, defineSteps }) => {
  let targetName = ''
  let targetConfigurationJson = ''
  let parsedTarget: Record<string, unknown> | undefined
  let parseError: Error | null = null

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }

    return parseYaml(docString) as T
  }

  defineSteps(({ Given, And, When, Then }) => {
    Given('the target directory name is {string}', (_ctx, value) => {
      targetName = value
      targetConfigurationJson = ''
      parsedTarget = undefined
      parseError = null
    })

    And('the target configuration JSON is:', (_ctx, docString) => {
      targetConfigurationJson = docString ?? ''
    })

    When('the deployment target configuration is parsed', () => {
      try {
        parsedTarget = parseDeploymentTargetConfig({
          targetName,
          targetConfigurationJson
        }) as Record<string, unknown>
        parseError = null
      } catch (error) {
        parsedTarget = undefined
        parseError = error as Error
      }
    })

    Then('the parsed target configuration is:', (_ctx, docString) => {
      expect(parseError).toBeNull()
      expect(parsedTarget).toEqual(parseYamlDocString(docString))
    })

    Then('the deployment target configuration is rejected with {string}', (_ctx, message) => {
      expect(parsedTarget).toBeUndefined()
      expect(parseError?.message).toBe(message)
    })
  })

  Scenario('An SSH target accepts the v2 target.json fields', () => {})

  Scenario('A container target accepts the v2 target.json fields', () => {})

  Scenario('An SSH target accepts relative deployment directories', () => {})

  Scenario('An SSH target requires an SSH address', () => {})

  Scenario('A container target requires a container name', () => {})

  Scenario('A target deployment path must not use ~', () => {})

  Scenario('A target base URL excludes ports and paths', () => {})
})
