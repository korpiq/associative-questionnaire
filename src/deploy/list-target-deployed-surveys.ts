import type { LoadedDeploymentTarget } from './load-deployment-target'

export type TargetDeployedSurvey = {
  publicHtmlFilename: string
  surveyName: string
  surveyPath: string
  templatePath: string
}

export function listTargetDeployedSurveys(
  target: LoadedDeploymentTarget
): TargetDeployedSurvey[] {
  return target.surveys.map((survey) => ({
    publicHtmlFilename: `${survey.surveyName}.html`,
    surveyName: survey.surveyName,
    surveyPath: survey.surveyPath,
    templatePath: survey.templatePath
  }))
}
