import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { buildSshInstallPlan } from '../../../src/deploy/build-ssh-install-plan'
import type { LoadedDeploymentTarget } from '../../../src/deploy/load-deployment-target'

const feature = await loadFeature('tests/feature/ssh-installer.feature')

describeFeature(feature, ({ Scenario }) => {
  let target: LoadedDeploymentTarget | undefined
  let localProtectionSecretFilePath = ''
  let plan:
    | {
        remotePublicRoot: string
        remoteCgiRoot: string
        remoteDataRoot: string
        remoteProtectionFilePath: string
        commands: Array<[string, ...string[]]>
      }
    | undefined
  let planError: Error | null = null

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }

    return parseYaml(docString) as T
  }

  Scenario('An SSH target produces remote copy commands from configured paths', ({ Given, And, When, Then }) => {
    Given('the loaded SSH deployment target is:', (_ctx, docString) => {
      target = parseYamlDocString<LoadedDeploymentTarget>(docString)
      localProtectionSecretFilePath = ''
      plan = undefined
      planError = null
    })

    And('the local reporter protection secret file path is {string}', (_ctx, value) => {
      localProtectionSecretFilePath = value
    })

    When('the SSH install plan is built', () => {
      try {
        if (!target) {
          throw new Error('Expected a loaded SSH deployment target')
        }

        plan = buildSshInstallPlan({
          target,
          localProtectionSecretFilePath
        })
        planError = null
      } catch (error) {
        plan = undefined
        planError = error as Error
      }
    })

    Then('the remote public root is {string}', (_ctx, value) => {
      expect(planError).toBeNull()
      expect(plan?.remotePublicRoot).toBe(value)
    })

    And('the remote CGI root is {string}', (_ctx, value) => {
      expect(planError).toBeNull()
      expect(plan?.remoteCgiRoot).toBe(value)
    })

    And('the remote data root is {string}', (_ctx, value) => {
      expect(planError).toBeNull()
      expect(plan?.remoteDataRoot).toBe(value)
    })

    And('the remote protection file path is {string}', (_ctx, value) => {
      expect(planError).toBeNull()
      expect(plan?.remoteProtectionFilePath).toBe(value)
    })

    And('the SSH install commands are:', (_ctx, docString) => {
      expect(planError).toBeNull()
      expect(plan?.commands).toEqual(parseYamlDocString(docString))
    })
  })

  Scenario('A non-SSH target is rejected', ({ Given, And, When, Then }) => {
    Given('the loaded SSH deployment target is:', (_ctx, docString) => {
      target = parseYamlDocString<LoadedDeploymentTarget>(docString)
      localProtectionSecretFilePath = ''
      plan = undefined
      planError = null
    })

    And('the local reporter protection secret file path is {string}', (_ctx, value) => {
      localProtectionSecretFilePath = value
    })

    When('the SSH install plan is built', () => {
      try {
        if (!target) {
          throw new Error('Expected a loaded SSH deployment target')
        }

        plan = buildSshInstallPlan({
          target,
          localProtectionSecretFilePath
        })
        planError = null
      } catch (error) {
        plan = undefined
        planError = error as Error
      }
    })

    Then('the SSH install plan is rejected with {string}', (_ctx, message) => {
      expect(plan).toBeUndefined()
      expect(planError?.message).toBe(message)
    })
  })
})
