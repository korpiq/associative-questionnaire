import type { GeneratedSurveyDeploymentSettings } from './build-generated-target-settings'
import { buildGeneratedTargetSettings } from './build-generated-target-settings'
import { loadDeploymentTarget } from './load-deployment-target'

export function resolveSurveyUrlPort(url: string): string {
  const parsedUrl = new URL(url)

  if (parsedUrl.port) {
    return parsedUrl.port
  }

  return parsedUrl.protocol === 'https:' ? '443' : '80'
}

export function resolveTargetSurveySettings(input: {
  workspaceDirectory: string
  targetName: string
  surveyName: string
}): GeneratedSurveyDeploymentSettings {
  const surveySettings = buildGeneratedTargetSettings(
    loadDeploymentTarget({
      workspaceDirectory: input.workspaceDirectory,
      targetName: input.targetName
    })
  ).surveys.find((survey) => survey.surveyName === input.surveyName)

  if (!surveySettings) {
    throw new Error(`Survey ${input.surveyName} was not found in target ${input.targetName}`)
  }

  return surveySettings
}
