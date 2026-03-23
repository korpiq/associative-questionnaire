import { resolve } from 'node:path'

import type {
  LoadedDeploymentSurvey,
  LoadedDeploymentTarget
} from './load-deployment-target'

function selectSurveys(
  surveys: LoadedDeploymentSurvey[],
  selectedSurveyDirectories: string[] | undefined
): LoadedDeploymentSurvey[] {
  if (!selectedSurveyDirectories || selectedSurveyDirectories.length === 0) {
    return surveys
  }

  const selectedDirectorySet = new Set(selectedSurveyDirectories.map((directory) => resolve(directory)))

  return surveys.filter((survey) => selectedDirectorySet.has(resolve(survey.surveyDirectory)))
}

export function filterLoadedDeploymentTargetSurveys(
  target: LoadedDeploymentTarget,
  selectedSurveyDirectories?: string[]
): LoadedDeploymentTarget {
  return {
    ...target,
    surveys: selectSurveys(target.surveys, selectedSurveyDirectories)
  }
}
