import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'

import { parseDeploymentTargetConfig } from '../../../src'

const feature = await loadFeature('tests/feature/deployment-target-config.feature')

describeFeature(feature, ({ Scenario }) => {
  let targetName = ''
  let targetConfigurationJson = ''
  let parsedTarget:
    | {
        targetName: string
        type: 'container' | 'ssh'
        sshTarget?: string
        containerName?: string
        publicPath: string
        cgiPath: string
        dataDir: string
        protectionFile: string
        publicBaseUrl: string
        saverUrl: string
        reporterUrl: string
        createMissingSubpaths: boolean
      }
    | undefined
  let parseError: Error | null = null

  function resetState(): void {
    targetName = ''
    targetConfigurationJson = ''
    parsedTarget = undefined
    parseError = null
  }

  function parseTarget(): void {
    try {
      parsedTarget = parseDeploymentTargetConfig({
        targetName,
        targetConfigurationJson
      })
      parseError = null
    } catch (error) {
      parsedTarget = undefined
      parseError = error as Error
    }
  }

  Scenario('An SSH target accepts shared fields and defaults optional settings', ({ Given, And, When, Then }) => {
    Given('the target directory name is {string}', (_ctx, value) => {
      resetState()
      targetName = value
    })

    And('the target configuration JSON is:', (_ctx, docString) => {
      targetConfigurationJson = docString ?? ''
    })

    When('the deployment target configuration is parsed', () => {
      parseTarget()
    })

    Then('the parsed target name is {string}', (_ctx, value) => {
      expect(parseError).toBeNull()
      expect(parsedTarget?.targetName).toBe(value)
    })

    And('the parsed target type is {string}', (_ctx, value) => {
      expect(parseError).toBeNull()
      expect(parsedTarget?.type).toBe(value)
    })

    And('the parsed SSH target is {string}', (_ctx, value) => {
      expect(parseError).toBeNull()
      expect(parsedTarget?.sshTarget ?? '').toBe(value)
    })

    And('the parsed container name is empty', () => {
      expect(parseError).toBeNull()
      expect(parsedTarget?.containerName).toBeUndefined()
    })

    And('the parsed public path is {string}', (_ctx, value) => {
      expect(parseError).toBeNull()
      expect(parsedTarget?.publicPath).toBe(value)
    })

    And('the parsed CGI path is {string}', (_ctx, value) => {
      expect(parseError).toBeNull()
      expect(parsedTarget?.cgiPath).toBe(value)
    })

    And('the parsed data directory is {string}', (_ctx, value) => {
      expect(parseError).toBeNull()
      expect(parsedTarget?.dataDir).toBe(value)
    })

    And('the parsed protection file is {string}', (_ctx, value) => {
      expect(parseError).toBeNull()
      expect(parsedTarget?.protectionFile).toBe(value)
    })

    And('the parsed create-missing-subpaths setting is true', () => {
      expect(parseError).toBeNull()
      expect(parsedTarget?.createMissingSubpaths).toBe(true)
    })
  })

  Scenario(
    'A container target accepts a custom protection file and creation flag',
    ({ Given, And, When, Then }) => {
      Given('the target directory name is {string}', (_ctx, value) => {
        resetState()
        targetName = value
      })

      And('the target configuration JSON is:', (_ctx, docString) => {
        targetConfigurationJson = docString ?? ''
      })

      When('the deployment target configuration is parsed', () => {
        parseTarget()
      })

      Then('the parsed target name is {string}', (_ctx, value) => {
        expect(parseError).toBeNull()
        expect(parsedTarget?.targetName).toBe(value)
      })

      And('the parsed target type is {string}', (_ctx, value) => {
        expect(parseError).toBeNull()
        expect(parsedTarget?.type).toBe(value)
      })

      And('the parsed SSH target is empty', () => {
        expect(parseError).toBeNull()
        expect(parsedTarget?.sshTarget).toBeUndefined()
      })

      And('the parsed container name is {string}', (_ctx, value) => {
        expect(parseError).toBeNull()
        expect(parsedTarget?.containerName).toBe(value)
      })

      And('the parsed protection file is {string}', (_ctx, value) => {
        expect(parseError).toBeNull()
        expect(parsedTarget?.protectionFile).toBe(value)
      })

      And('the parsed create-missing-subpaths setting is false', () => {
        expect(parseError).toBeNull()
        expect(parsedTarget?.createMissingSubpaths).toBe(false)
      })
    }
  )

  Scenario('An SSH target requires an SSH address', ({ Given, And, When, Then }) => {
    Given('the target directory name is {string}', (_ctx, value) => {
      resetState()
      targetName = value
    })

    And('the target configuration JSON is:', (_ctx, docString) => {
      targetConfigurationJson = docString ?? ''
    })

    When('the deployment target configuration is parsed', () => {
      parseTarget()
    })

    Then('the deployment target configuration is rejected with {string}', (_ctx, message) => {
      expect(parsedTarget).toBeUndefined()
      expect(parseError?.message).toBe(message)
    })
  })

  Scenario('A container target requires a container name', ({ Given, And, When, Then }) => {
    Given('the target directory name is {string}', (_ctx, value) => {
      resetState()
      targetName = value
    })

    And('the target configuration JSON is:', (_ctx, docString) => {
      targetConfigurationJson = docString ?? ''
    })

    When('the deployment target configuration is parsed', () => {
      parseTarget()
    })

    Then('the deployment target configuration is rejected with {string}', (_ctx, message) => {
      expect(parsedTarget).toBeUndefined()
      expect(parseError?.message).toBe(message)
    })
  })
})
