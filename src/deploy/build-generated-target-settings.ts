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

function normalizeUrlSegment(segment: string): string {
  return segment.replace(/^\/+|\/+$/g, '')
}

function buildConfiguredUrl(
  baseUrl: string,
  port: number | undefined,
  uriPath: string,
  ...segments: string[]
): string {
  const url = new URL(baseUrl)

  if (port !== undefined) {
    url.port = String(port)
  }

  url.pathname = `/${[uriPath, ...segments].map(normalizeUrlSegment).filter(Boolean).join('/')}`

  return url.toString()
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
      const saveUrl = buildConfiguredUrl(
        target.baseUrl,
        target.port,
        target.cgiUriPath,
        survey.surveyName,
        saveCgiFilename
      )
      const reportUrl = buildConfiguredUrl(
        target.baseUrl,
        target.port,
        target.cgiUriPath,
        survey.surveyName,
        reportCgiFilename
      )

      return {
        surveyName: survey.surveyName,
        surveyPath: survey.surveyPath,
        templatePath: survey.templatePath,
        publicDir,
        publicUrl: ensureTrailingSlash(
          buildConfiguredUrl(target.baseUrl, target.port, target.staticUriPath, survey.surveyName)
        ),
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
