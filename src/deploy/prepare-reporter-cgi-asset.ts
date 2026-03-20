import type {
  GeneratedReporterCgiSettings,
  GeneratedSurveyDeploymentSettings
} from './build-generated-target-settings'

const SURVEYS_DATA_DIR_PLACEHOLDER = '__SURVEYS_DATA_DIR__'
const ANSWERS_DATA_DIR_PLACEHOLDER = '__ANSWERS_DATA_DIR__'
const SURVEY_NAME_PLACEHOLDER = '__SURVEY_NAME__'
const PRIVATE_SURVEY_PATH_PLACEHOLDER = '__PRIVATE_SURVEY_PATH__'
const PRIVATE_ANSWERS_DIR_PLACEHOLDER = '__PRIVATE_ANSWERS_DIR__'

function hasPerSurveyPrivatePaths(
  settings: GeneratedReporterCgiSettings | GeneratedSurveyDeploymentSettings
): settings is GeneratedSurveyDeploymentSettings {
  return 'privateSurveyPath' in settings && 'privateAnswersDir' in settings
}

export function prepareReporterCgiAsset(input: {
  reporterScriptTemplate: string
  reporterCgiSettings: GeneratedReporterCgiSettings | GeneratedSurveyDeploymentSettings
}): {
  preparedReporterScript: string
} {
  if (hasPerSurveyPrivatePaths(input.reporterCgiSettings)) {
    return {
      preparedReporterScript: input.reporterScriptTemplate
        .replaceAll(SURVEY_NAME_PLACEHOLDER, input.reporterCgiSettings.surveyName)
        .replaceAll(PRIVATE_SURVEY_PATH_PLACEHOLDER, input.reporterCgiSettings.privateSurveyPath)
        .replaceAll(PRIVATE_ANSWERS_DIR_PLACEHOLDER, input.reporterCgiSettings.privateAnswersDir)
    }
  }

  return {
    preparedReporterScript: input.reporterScriptTemplate
      .replaceAll(SURVEYS_DATA_DIR_PLACEHOLDER, input.reporterCgiSettings.surveysDataDir)
      .replaceAll(ANSWERS_DATA_DIR_PLACEHOLDER, input.reporterCgiSettings.answersDataDir)
  }
}
