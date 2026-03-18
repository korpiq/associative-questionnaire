import type { GeneratedSaverCgiSettings } from './build-generated-target-settings'

const SURVEYS_DATA_DIR_PLACEHOLDER = '__SURVEYS_DATA_DIR__'
const ANSWERS_DATA_DIR_PLACEHOLDER = '__ANSWERS_DATA_DIR__'

export function prepareSaverCgiAsset(input: {
  saverScriptTemplate: string
  saverCgiSettings: GeneratedSaverCgiSettings
}): string {
  return input.saverScriptTemplate
    .replaceAll(SURVEYS_DATA_DIR_PLACEHOLDER, input.saverCgiSettings.surveysDataDir)
    .replaceAll(ANSWERS_DATA_DIR_PLACEHOLDER, input.saverCgiSettings.answersDataDir)
}
