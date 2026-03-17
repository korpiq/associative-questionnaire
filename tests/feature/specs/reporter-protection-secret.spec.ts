import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { afterAll, expect } from 'vitest'

import { prepareReporterProtectionSecret } from '../../../src'

const feature = await loadFeature('tests/feature/reporter-protection-secret.feature')

describeFeature(feature, ({ Scenario }) => {
  const createdWorkspaceDirectories: string[] = []
  let deploymentWorkspaceDirectory = ''
  let reporterScriptTemplate = ''
  let preparedSecret: {
    preparedReporterScript: string
    protectionSecret: string
    storedSecretFilePath: string
  }

  afterAll(() => {
    createdWorkspaceDirectories.forEach((directory) => {
      rmSync(directory, { recursive: true, force: true })
    })
  })

  Scenario(
    'A deploy helper injects the reporter protection secret into a script template and stores it locally',
    ({ Given, And, When, Then }) => {
      Given('an empty deployment workspace directory', () => {
        deploymentWorkspaceDirectory = mkdtempSync(join(process.cwd(), '.test-deploy-workspace-'))
        createdWorkspaceDirectories.push(deploymentWorkspaceDirectory)
        reporterScriptTemplate = ''
        preparedSecret = {
          preparedReporterScript: '',
          protectionSecret: '',
          storedSecretFilePath: ''
        }
      })

      And('the reporter script template is:', (_ctx, docString) => {
        reporterScriptTemplate = docString ?? ''
      })

      When('the reporter protection secret is prepared', () => {
        preparedSecret = prepareReporterProtectionSecret({
          reporterScriptTemplate,
          deploymentWorkspaceDirectory
        })
      })

      Then('the prepared reporter script omits {string}', (_ctx, text) => {
        expect(preparedSecret.preparedReporterScript).not.toContain(text)
      })

      And('the prepared reporter script contains:', (_ctx, docString) => {
        expect(preparedSecret.preparedReporterScript).toContain(docString ?? '')
      })

      And('the stored reporter protection secret file path is {string}', (_ctx, path) => {
        expect(relative(deploymentWorkspaceDirectory, preparedSecret.storedSecretFilePath)).toBe(path)
      })

      And('the stored reporter protection secret matches the injected reporter protection secret', () => {
        expect(readFileSync(preparedSecret.storedSecretFilePath, 'utf8')).toBe(
          preparedSecret.protectionSecret
        )
        expect(preparedSecret.preparedReporterScript).toContain(preparedSecret.protectionSecret)
      })
    }
  )
})
