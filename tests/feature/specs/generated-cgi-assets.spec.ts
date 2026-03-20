import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { prepareReporterCgiAsset, prepareSaverCgiAsset } from '../../../src'

const feature = await loadFeature('tests/feature/generated-cgi-assets.feature')

describeFeature(feature, ({ Scenario }) => {
  let saverCgiTemplate = ''
  let saverCgiSettings = { surveysDataDir: '', answersDataDir: '' }
  let preparedSaverCgiAsset = ''
  let reporterCgiTemplate = ''
  let reporterCgiSettings = { surveysDataDir: '', answersDataDir: '' }
  let preparedReporterCgiAsset = ''

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }

    return parseYaml(docString) as T
  }

  Scenario('A saver CGI asset injects the configured runtime data directories', ({ Given, And, When, Then }) => {
    Given('the saver CGI template is:', (_ctx, docString) => {
      saverCgiTemplate = docString ?? ''
      saverCgiSettings = { surveysDataDir: '', answersDataDir: '' }
      preparedSaverCgiAsset = ''
    })

    And('the saver CGI settings are:', (_ctx, docString) => {
      saverCgiSettings = parseYamlDocString(docString)
    })

    When('the saver CGI asset is prepared', () => {
      preparedSaverCgiAsset = prepareSaverCgiAsset({
        saverScriptTemplate: saverCgiTemplate,
        saverCgiSettings
      })
    })

    Then('the prepared saver CGI asset omits:', (_ctx, docString) => {
      parseYamlDocString<string[]>(docString).forEach((text) => {
        expect(preparedSaverCgiAsset).not.toContain(text)
      })
    })

    And('the prepared saver CGI asset contains:', (_ctx, docString) => {
      parseYamlDocString<string[]>(docString).forEach((text) => {
        expect(preparedSaverCgiAsset).toContain(text)
      })
    })
  })

  Scenario(
    'A reporter CGI asset injects runtime data directories only',
    ({ Given, And, When, Then }) => {
      Given('the reporter CGI template is:', (_ctx, docString) => {
        reporterCgiTemplate = ''
        reporterCgiTemplate = docString ?? ''
        reporterCgiSettings = { surveysDataDir: '', answersDataDir: '' }
        preparedReporterCgiAsset = ''
      })

      And('the reporter CGI settings are:', (_ctx, docString) => {
        reporterCgiSettings = parseYamlDocString(docString)
      })

      When('the reporter CGI asset is prepared', () => {
        preparedReporterCgiAsset = prepareReporterCgiAsset({
          reporterScriptTemplate: reporterCgiTemplate,
          reporterCgiSettings
        }).preparedReporterScript
      })

      Then('the prepared reporter CGI asset omits:', (_ctx, docString) => {
        parseYamlDocString<string[]>(docString).forEach((text) => {
          expect(preparedReporterCgiAsset).not.toContain(text)
        })
      })

      And('the prepared reporter CGI asset contains:', (_ctx, docString) => {
        parseYamlDocString<string[]>(docString).forEach((text) => {
          expect(preparedReporterCgiAsset).toContain(text)
        })
      })
    }
  )
})
