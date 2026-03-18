import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { buildSshInstallPlan } from '../../../src/deploy/build-ssh-install-plan'

const feature = await loadFeature('tests/feature/ssh-installer.feature')

describeFeature(feature, ({ Scenario }) => {
  let sshTarget = ''
  let installPath = ''
  let plan:
    | {
        remotePublicRoot: string
        remoteRuntimeRoot: string
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

  Scenario(
    'A valid install path produces remote copy commands under the remote home directory',
    ({ Given, And, When, Then }) => {
      Given('the SSH target is {string}', (_ctx, value) => {
        sshTarget = value
        installPath = ''
        plan = undefined
        planError = null
      })

      And('the remote install path is {string}', (_ctx, value) => {
        installPath = value
      })

      When('the SSH install plan is built', () => {
        try {
          plan = buildSshInstallPlan({ sshTarget, installPath })
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

      And('the remote runtime root is {string}', (_ctx, value) => {
        expect(planError).toBeNull()
        expect(plan?.remoteRuntimeRoot).toBe(value)
      })

      And('the SSH install commands are:', (_ctx, docString) => {
        expect(planError).toBeNull()
        expect(plan?.commands).toEqual(parseYamlDocString(docString))
      })
    }
  )

  Scenario('An absolute remote install path is rejected', ({ Given, And, When, Then }) => {
    Given('the SSH target is {string}', (_ctx, value) => {
      sshTarget = value
      installPath = ''
      plan = undefined
      planError = null
    })

    And('the remote install path is {string}', (_ctx, value) => {
      installPath = value
    })

    When('the SSH install plan is built', () => {
      try {
        plan = buildSshInstallPlan({ sshTarget, installPath })
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
