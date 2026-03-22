import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { buildGeneratedTargetSettings } from '../../../src'
import type { LoadedDeploymentTarget } from '../../../src/deploy/load-deployment-target'

const feature = await loadFeature('tests/feature/generated-target-settings.feature')

describeFeature(feature, ({ Scenario }) => {
  let loadedTarget: LoadedDeploymentTarget | undefined
  let generatedTargetSettings:
    | ReturnType<typeof buildGeneratedTargetSettings>
    | undefined

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }

    return parseYaml(docString) as T
  }

  Scenario(
    'A loaded target produces per-survey public, CGI, and private-data settings',
    ({ Given, When, Then }) => {
    Given('the loaded deployment target is:', (_ctx, docString) => {
      loadedTarget = parseYamlDocString<LoadedDeploymentTarget>(docString)
      generatedTargetSettings = undefined
    })

    When('the generated target settings are built', () => {
      if (!loadedTarget) {
        throw new Error('Expected a loaded deployment target')
      }

      generatedTargetSettings = buildGeneratedTargetSettings(loadedTarget)
    })

    Then('the generated survey deployment settings are:', (_ctx, docString) => {
      expect(generatedTargetSettings?.surveys).toEqual(parseYamlDocString(docString))
    })
  }
  )

  Scenario('A loaded target uses its configured non-default port in generated URLs', ({
    Given,
    When,
    Then
  }) => {
    Given('the loaded deployment target is:', (_ctx, docString) => {
      loadedTarget = parseYamlDocString<LoadedDeploymentTarget>(docString)
      generatedTargetSettings = undefined
    })

    When('the generated target settings are built', () => {
      if (!loadedTarget) {
        throw new Error('Expected a loaded deployment target')
      }

      generatedTargetSettings = buildGeneratedTargetSettings(loadedTarget)
    })

    Then('the generated survey deployment settings are:', (_ctx, docString) => {
      expect(generatedTargetSettings?.surveys).toEqual(parseYamlDocString(docString))
    })
  })
})
