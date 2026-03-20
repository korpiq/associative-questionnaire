import type {
  GeneratedReporterCgiSettings,
  GeneratedSurveyDeploymentSettings
} from './build-generated-target-settings'
import { bundleGeneratedCgiSource } from './bundle-generated-cgi-source'
import { relative } from 'node:path'

const SURVEYS_DATA_DIR_PLACEHOLDER = '__SURVEYS_DATA_DIR__'
const ANSWERS_DATA_DIR_PLACEHOLDER = '__ANSWERS_DATA_DIR__'
const SURVEY_NAME_PLACEHOLDER = '__SURVEY_NAME__'
const PRIVATE_SURVEY_RELATIVE_PATH_PLACEHOLDER = '__PRIVATE_SURVEY_RELATIVE_PATH__'
const PRIVATE_ANSWERS_RELATIVE_PATH_PLACEHOLDER = '__PRIVATE_ANSWERS_RELATIVE_PATH__'

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
    const privateSurveyRelativePath = relative(
      input.reporterCgiSettings.cgiDir,
      input.reporterCgiSettings.privateSurveyPath
    )
    const privateAnswersRelativePath = relative(
      input.reporterCgiSettings.cgiDir,
      input.reporterCgiSettings.privateAnswersDir
    )

    return {
      preparedReporterScript: bundleGeneratedCgiSource(
        input.reporterScriptTemplate
          .replaceAll(SURVEY_NAME_PLACEHOLDER, input.reporterCgiSettings.surveyName)
          .replaceAll(PRIVATE_SURVEY_RELATIVE_PATH_PLACEHOLDER, privateSurveyRelativePath)
          .replaceAll(PRIVATE_ANSWERS_RELATIVE_PATH_PLACEHOLDER, privateAnswersRelativePath)
      )
    }
  }

  return {
    preparedReporterScript: bundleGeneratedCgiSource(
      input.reporterScriptTemplate
        .replaceAll(SURVEYS_DATA_DIR_PLACEHOLDER, input.reporterCgiSettings.surveysDataDir)
        .replaceAll(ANSWERS_DATA_DIR_PLACEHOLDER, input.reporterCgiSettings.answersDataDir)
    )
  }
}
