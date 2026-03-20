import type { LoadedDeploymentTarget } from './load-deployment-target'

export type GeneratedSurveyHtmlSettings = {
  surveyName: string
  surveyPath: string
  templatePath: string
  publicHtmlFilename: string
  formAction: string
}

export type GeneratedSaverCgiSettings = {
  surveysDataDir: string
  answersDataDir: string
}

export type GeneratedReporterCgiSettings = GeneratedSaverCgiSettings

export type GeneratedTargetSettings = {
  surveyHtml: GeneratedSurveyHtmlSettings[]
  saverCgi: GeneratedSaverCgiSettings
  reporterCgi: GeneratedReporterCgiSettings
}

function appendConfiguredPath(path: string, segment: string): string {
  return path.endsWith('/') ? `${path}${segment}` : `${path}/${segment}`
}

export function buildGeneratedTargetSettings(
  target: LoadedDeploymentTarget
): GeneratedTargetSettings {
  const surveysDataDir = appendConfiguredPath(target.dataDir, 'surveys')
  const answersDataDir = appendConfiguredPath(target.dataDir, 'answers')

  return {
    surveyHtml: target.surveys.map((survey) => ({
      surveyName: survey.surveyName,
      surveyPath: survey.surveyPath,
      templatePath: survey.templatePath,
      publicHtmlFilename: `${survey.surveyName}.html`,
      formAction: target.saverUrl
    })),
    saverCgi: {
      surveysDataDir,
      answersDataDir
    },
    reporterCgi: {
      surveysDataDir,
      answersDataDir
    }
  }
}
