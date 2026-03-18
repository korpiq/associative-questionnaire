import type { GeneratedReporterCgiSettings } from './build-generated-target-settings'
import { prepareReporterProtectionSecret } from '../reporter/prepare-reporter-protection-secret'

const SURVEYS_DATA_DIR_PLACEHOLDER = '__SURVEYS_DATA_DIR__'
const ANSWERS_DATA_DIR_PLACEHOLDER = '__ANSWERS_DATA_DIR__'
const PROTECTION_FILE_PLACEHOLDER = '__PROTECTION_FILE__'

export function prepareReporterCgiAsset(input: {
  reporterScriptTemplate: string
  reporterCgiSettings: GeneratedReporterCgiSettings
  deploymentWorkspaceDirectory: string
  storedSecretRelativePath?: string
}): {
  preparedReporterScript: string
  protectionSecret: string
  storedSecretFilePath: string
} {
  const runtimeConfiguredTemplate = input.reporterScriptTemplate
    .replaceAll(SURVEYS_DATA_DIR_PLACEHOLDER, input.reporterCgiSettings.surveysDataDir)
    .replaceAll(ANSWERS_DATA_DIR_PLACEHOLDER, input.reporterCgiSettings.answersDataDir)
    .replaceAll(PROTECTION_FILE_PLACEHOLDER, input.reporterCgiSettings.protectionFile)

  return prepareReporterProtectionSecret({
    reporterScriptTemplate: runtimeConfiguredTemplate,
    deploymentWorkspaceDirectory: input.deploymentWorkspaceDirectory,
    ...(input.storedSecretRelativePath
      ? { storedSecretRelativePath: input.storedSecretRelativePath }
      : {})
  })
}
