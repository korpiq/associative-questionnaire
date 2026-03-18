import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { afterAll, expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { prepareReporterCgiAsset, prepareSaverCgiAsset } from '../../../src'

const feature = await loadFeature('tests/feature/generated-cgi-assets.feature')

describeFeature(feature, ({ Scenario }) => {
  const createdWorkspaceDirectories: string[] = []
  let deploymentWorkspaceDirectory = ''
  let saverCgiTemplate = ''
  let saverCgiSettings = { surveysDataDir: '', answersDataDir: '' }
  let preparedSaverCgiAsset = ''
  let reporterCgiTemplate = ''
  let reporterCgiSettings = { surveysDataDir: '', answersDataDir: '', protectionFile: '' }
  let preparedReporterCgiAsset:
    | {
        preparedReporterScript: string
        protectionSecret: string
        storedSecretFilePath: string
      }
    | undefined

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }

    return parseYaml(docString) as T
  }

  afterAll(() => {
    createdWorkspaceDirectories.forEach((directory) => {
      rmSync(directory, { recursive: true, force: true })
    })
  })

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
    'A reporter CGI asset injects runtime data directories and the protection secret',
    ({ Given, And, When, Then }) => {
      Given('an empty deployment workspace directory', () => {
        deploymentWorkspaceDirectory = mkdtempSync(join(process.cwd(), '.test-generated-cgi-'))
        createdWorkspaceDirectories.push(deploymentWorkspaceDirectory)
        reporterCgiTemplate = ''
        reporterCgiSettings = { surveysDataDir: '', answersDataDir: '', protectionFile: '' }
        preparedReporterCgiAsset = undefined
      })

      And('the reporter CGI template is:', (_ctx, docString) => {
        reporterCgiTemplate = docString ?? ''
      })

      And('the reporter CGI settings are:', (_ctx, docString) => {
        reporterCgiSettings = parseYamlDocString(docString)
      })

      When('the reporter CGI asset is prepared', () => {
        preparedReporterCgiAsset = prepareReporterCgiAsset({
          reporterScriptTemplate: reporterCgiTemplate,
          reporterCgiSettings,
          deploymentWorkspaceDirectory
        })
      })

      Then('the prepared reporter CGI asset omits:', (_ctx, docString) => {
        parseYamlDocString<string[]>(docString).forEach((text) => {
          expect(preparedReporterCgiAsset?.preparedReporterScript).not.toContain(text)
        })
      })

      And('the prepared reporter CGI asset contains:', (_ctx, docString) => {
        parseYamlDocString<string[]>(docString).forEach((text) => {
          expect(preparedReporterCgiAsset?.preparedReporterScript).toContain(text)
        })
      })

      And('the stored reporter protection secret file path is {string}', (_ctx, path) => {
        expect(
          relative(deploymentWorkspaceDirectory, preparedReporterCgiAsset?.storedSecretFilePath ?? '')
        ).toBe(path)
      })

      And('the stored reporter protection secret matches the injected reporter protection secret', () => {
        expect(
          readFileSync(preparedReporterCgiAsset?.storedSecretFilePath ?? '', 'utf8')
        ).toBe(preparedReporterCgiAsset?.protectionSecret)
        expect(preparedReporterCgiAsset?.preparedReporterScript).toContain(
          preparedReporterCgiAsset?.protectionSecret ?? ''
        )
      })
    }
  )
})
