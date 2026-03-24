import type {
  GeneratedSaverCgiSettings,
  GeneratedSurveyDeploymentSettings
} from './build-generated-target-settings'
import { bundleGeneratedCgiSource } from './bundle-generated-cgi-source'
import { relative } from 'node:path'

const SURVEYS_DATA_DIR_PLACEHOLDER = '__SURVEYS_DATA_DIR__'
const ANSWERS_DATA_DIR_PLACEHOLDER = '__ANSWERS_DATA_DIR__'
const PRIVATE_ANSWERS_RELATIVE_PATH_PLACEHOLDER = '__PRIVATE_ANSWERS_RELATIVE_PATH__'
const DEFAULT_OK_URL_PLACEHOLDER = '__DEFAULT_OK_URL__'
const DEFAULT_FAIL_URL_PLACEHOLDER = '__DEFAULT_FAIL_URL__'

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
    const privateAnswersRelativePath = relative(
      input.saverCgiSettings.cgiDir,
      input.saverCgiSettings.privateAnswersDir
    )

    return bundleGeneratedCgiSource(
      input.saverScriptTemplate
        .replaceAll(PRIVATE_ANSWERS_RELATIVE_PATH_PLACEHOLDER, privateAnswersRelativePath)
        .replaceAll(DEFAULT_OK_URL_PLACEHOLDER, input.saverCgiSettings.okUrl)
        .replaceAll(DEFAULT_FAIL_URL_PLACEHOLDER, input.saverCgiSettings.failUrl)
    )
  }

  return bundleGeneratedCgiSource(
    input.saverScriptTemplate
      .replaceAll(SURVEYS_DATA_DIR_PLACEHOLDER, input.saverCgiSettings.surveysDataDir)
      .replaceAll(ANSWERS_DATA_DIR_PLACEHOLDER, input.saverCgiSettings.answersDataDir)
  )
}
