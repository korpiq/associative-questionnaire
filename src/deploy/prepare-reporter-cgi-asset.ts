import type { GeneratedReporterCgiSettings } from './build-generated-target-settings'

const SURVEYS_DATA_DIR_PLACEHOLDER = '__SURVEYS_DATA_DIR__'
const ANSWERS_DATA_DIR_PLACEHOLDER = '__ANSWERS_DATA_DIR__'

export function prepareReporterCgiAsset(input: {
  reporterScriptTemplate: string
  reporterCgiSettings: GeneratedReporterCgiSettings
}): {
  preparedReporterScript: string
} {
  return {
    preparedReporterScript: input.reporterScriptTemplate
      .replaceAll(SURVEYS_DATA_DIR_PLACEHOLDER, input.reporterCgiSettings.surveysDataDir)
      .replaceAll(ANSWERS_DATA_DIR_PLACEHOLDER, input.reporterCgiSettings.answersDataDir)
  }
}
