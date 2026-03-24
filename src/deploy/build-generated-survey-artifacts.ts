import { renderSaverResultPage } from '../cgi/render-saver-cgi-response'
import { generateSurveyHtml } from '../generator/generate-survey-html'
import { parseSurvey } from '../schema/survey'

import type { GeneratedSurveyDeploymentSettings } from './build-generated-target-settings'
import { prepareReporterCgiAsset } from './prepare-reporter-cgi-asset'
import { prepareSaverCgiAsset } from './prepare-saver-cgi-asset'

type GeneratedArtifactFile = {
  relativePath: string
  contents: string
}

export type GeneratedSurveyArtifacts = {
  publicFiles: GeneratedArtifactFile[]
  cgiFiles: GeneratedArtifactFile[]
  privateFiles: GeneratedArtifactFile[]
}

function buildSaveFormAction(surveySettings: GeneratedSurveyDeploymentSettings): string {
  return surveySettings.saveUrl
}

function rewriteScriptShebang(scriptTemplate: string, nodeExecutable: string): string {
  const normalizedTemplate = scriptTemplate.trimStart()

  if (!normalizedTemplate.startsWith('#!')) {
    return normalizedTemplate
  }

  const [firstLine, ...remainingLines] = normalizedTemplate.split('\n')
  if (!firstLine) {
    return normalizedTemplate
  }
  const shebangTokens = firstLine.slice(2).trim().split(/\s+/)
  const shebangArguments = shebangTokens.slice(1)
  const rewrittenShebang = `#!${[nodeExecutable, ...shebangArguments].join(' ')}`

  return [rewrittenShebang, ...remainingLines].join('\n')
}

function ensureScriptShebang(scriptContents: string, nodeExecutable: string): string {
  if (scriptContents.startsWith('#!')) {
    return scriptContents
  }

  const shebang = `#!${nodeExecutable}`

  return `${shebang}\n${scriptContents}`
}

export function buildGeneratedSurveyArtifacts(input: {
  surveyJson: string
  surveyTemplate: string
  saverScriptTemplate: string
  reporterScriptTemplate: string
  surveySettings: GeneratedSurveyDeploymentSettings
  nodeExecutable: string
}): GeneratedSurveyArtifacts {
  const survey = parseSurvey(JSON.parse(input.surveyJson))
  const surveyHtml = generateSurveyHtml(survey, input.surveyTemplate, {
    surveyName: input.surveySettings.surveyName,
    formAction: buildSaveFormAction(input.surveySettings)
  })
  const okPage = renderSaverResultPage({ success: true })
  const failPage = renderSaverResultPage({ success: false })
  const rewrittenSaverTemplate = rewriteScriptShebang(input.saverScriptTemplate, input.nodeExecutable)
  const rewrittenReporterTemplate = rewriteScriptShebang(
    input.reporterScriptTemplate,
    input.nodeExecutable
  )
  const preparedSaverScript = prepareSaverCgiAsset({
    saverScriptTemplate: rewrittenSaverTemplate,
    saverCgiSettings: input.surveySettings
  })
  const preparedReporterScript = prepareReporterCgiAsset({
    reporterScriptTemplate: rewrittenReporterTemplate,
    reporterCgiSettings: input.surveySettings
  }).preparedReporterScript

  return {
    publicFiles: [
      {
        relativePath: input.surveySettings.publicHtmlFilename,
        contents: surveyHtml
      },
      {
        relativePath: 'ok.html',
        contents: okPage
      },
      {
        relativePath: 'fail.html',
        contents: failPage
      }
    ],
    cgiFiles: [
      {
        relativePath: input.surveySettings.saveCgiFilename,
        contents: ensureScriptShebang(preparedSaverScript, input.nodeExecutable)
      },
      {
        relativePath: input.surveySettings.reportCgiFilename,
        contents: ensureScriptShebang(preparedReporterScript, input.nodeExecutable)
      }
    ],
    privateFiles: [
      {
        relativePath: 'survey.json',
        contents: input.surveyJson
      }
    ]
  }
}
