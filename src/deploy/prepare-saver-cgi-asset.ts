import type {
  GeneratedSaverCgiSettings,
  GeneratedSurveyDeploymentSettings
} from './build-generated-target-settings'
import { bundleGeneratedCgiSource } from './bundle-generated-cgi-source'
import { relative } from 'node:path'

const SURVEYS_DATA_DIR_PLACEHOLDER = '__SURVEYS_DATA_DIR__'
const ANSWERS_DATA_DIR_PLACEHOLDER = '__ANSWERS_DATA_DIR__'
const PRIVATE_SURVEY_RELATIVE_PATH_PLACEHOLDER = '__PRIVATE_SURVEY_RELATIVE_PATH__'
const PRIVATE_ANSWERS_RELATIVE_PATH_PLACEHOLDER = '__PRIVATE_ANSWERS_RELATIVE_PATH__'

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
    const privateSurveyRelativePath = relative(
      input.saverCgiSettings.cgiDir,
      input.saverCgiSettings.privateSurveyPath
    )
    const privateAnswersRelativePath = relative(
      input.saverCgiSettings.cgiDir,
      input.saverCgiSettings.privateAnswersDir
    )

    return bundleGeneratedCgiSource(
      input.saverScriptTemplate
        .replaceAll(PRIVATE_SURVEY_RELATIVE_PATH_PLACEHOLDER, privateSurveyRelativePath)
        .replaceAll(PRIVATE_ANSWERS_RELATIVE_PATH_PLACEHOLDER, privateAnswersRelativePath)
    )
  }

  return bundleGeneratedCgiSource(
    input.saverScriptTemplate
      .replaceAll(SURVEYS_DATA_DIR_PLACEHOLDER, input.saverCgiSettings.surveysDataDir)
      .replaceAll(ANSWERS_DATA_DIR_PLACEHOLDER, input.saverCgiSettings.answersDataDir)
  )
}
