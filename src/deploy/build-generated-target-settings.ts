import type { LoadedDeploymentTarget } from './load-deployment-target'

export type GeneratedSurveyDeploymentSettings = {
  surveyName: string
  surveyPath: string
  templatePath: string
  publicDir: string
  publicUrl: string
  publicHtmlFilename: string
  cgiDir: string
  saveCgiFilename: string
  saveUrl: string
  reportCgiFilename: string
  reportUrl: string
  privateDataDir: string
  privateSurveyPath: string
  privateAnswersDir: string
}

export type GeneratedSaverCgiSettings = {
  surveysDataDir: string
  answersDataDir: string
}

export type GeneratedReporterCgiSettings = GeneratedSaverCgiSettings

export type GeneratedTargetSettings = {
  surveys: GeneratedSurveyDeploymentSettings[]
}

function appendConfiguredPath(path: string, segment: string): string {
  return path.endsWith('/') ? `${path}${segment}` : `${path}/${segment}`
}

function appendConfiguredUrl(url: string, segment: string): string {
  return url.endsWith('/') ? `${url}${segment}` : `${url}/${segment}`
}

function ensureTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`
}

export function buildGeneratedTargetSettings(
  target: LoadedDeploymentTarget
): GeneratedTargetSettings {
  return {
    surveys: target.surveys.map((survey) => {
      const publicDir = appendConfiguredPath(target.publicDir, survey.surveyName)
      const cgiDir = appendConfiguredPath(target.cgiDir, survey.surveyName)
      const privateDataDir = appendConfiguredPath(target.dataDir, survey.surveyName)
      const saveCgiFilename = `save${target.cgiExtension}`
      const reportCgiFilename = `report${target.cgiExtension}`
      const saveUrl = appendConfiguredUrl(
        appendConfiguredUrl(target.cgiBaseUrl, survey.surveyName),
        saveCgiFilename
      )
      const reportUrl = appendConfiguredUrl(
        appendConfiguredUrl(target.cgiBaseUrl, survey.surveyName),
        reportCgiFilename
      )

      return {
        surveyName: survey.surveyName,
        surveyPath: survey.surveyPath,
        templatePath: survey.templatePath,
        publicDir,
        publicUrl: ensureTrailingSlash(appendConfiguredUrl(target.publicBaseUrl, survey.surveyName)),
        publicHtmlFilename: 'index.html',
        cgiDir,
        saveCgiFilename,
        saveUrl,
        reportCgiFilename,
        reportUrl,
        privateDataDir,
        privateSurveyPath: appendConfiguredPath(privateDataDir, 'survey.json'),
        privateAnswersDir: appendConfiguredPath(privateDataDir, 'answers')
      }
    })
  }
}
