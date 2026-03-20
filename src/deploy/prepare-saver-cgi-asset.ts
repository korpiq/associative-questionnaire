import type {
  GeneratedSaverCgiSettings,
  GeneratedSurveyDeploymentSettings
} from './build-generated-target-settings'

const SURVEYS_DATA_DIR_PLACEHOLDER = '__SURVEYS_DATA_DIR__'
const ANSWERS_DATA_DIR_PLACEHOLDER = '__ANSWERS_DATA_DIR__'
const PRIVATE_SURVEY_PATH_PLACEHOLDER = '__PRIVATE_SURVEY_PATH__'
const PRIVATE_ANSWERS_DIR_PLACEHOLDER = '__PRIVATE_ANSWERS_DIR__'

function hasPerSurveyPrivatePaths(
  settings: GeneratedSaverCgiSettings | GeneratedSurveyDeploymentSettings
): settings is GeneratedSurveyDeploymentSettings {
  return 'privateSurveyPath' in settings && 'privateAnswersDir' in settings
}

export function prepareSaverCgiAsset(input: {
  saverScriptTemplate: string
  saverCgiSettings: GeneratedSaverCgiSettings | GeneratedSurveyDeploymentSettings
}): string {
  if (hasPerSurveyPrivatePaths(input.saverCgiSettings)) {
    return input.saverScriptTemplate
      .replaceAll(PRIVATE_SURVEY_PATH_PLACEHOLDER, input.saverCgiSettings.privateSurveyPath)
      .replaceAll(PRIVATE_ANSWERS_DIR_PLACEHOLDER, input.saverCgiSettings.privateAnswersDir)
  }

  return input.saverScriptTemplate
    .replaceAll(SURVEYS_DATA_DIR_PLACEHOLDER, input.saverCgiSettings.surveysDataDir)
    .replaceAll(ANSWERS_DATA_DIR_PLACEHOLDER, input.saverCgiSettings.answersDataDir)
}
