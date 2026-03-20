#!/usr/local/bin/node --experimental-specifier-resolution=node

import {
  buildReporterStatistics
} from '../reporter/build-reporter-statistics'
import { renderReporterHtmlPage } from '../reporter/render-reporter-html-page'
import { resolveStoredReporterSurveyFromPaths } from '../reporter/resolve-stored-reporter-survey'
import { resolveCgiScriptRuntimePaths } from '../cgi/resolve-cgi-script-runtime-paths'

const PRIVATE_SURVEY_RELATIVE_PATH = '__PRIVATE_SURVEY_RELATIVE_PATH__'
const PRIVATE_ANSWERS_RELATIVE_PATH = '__PRIVATE_ANSWERS_RELATIVE_PATH__'

function toOptional(value) {
  return value === null || value === '' ? undefined : value
}

function readRequestBody() {
  return new Promise((resolve, reject) => {
    let body = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => {
      body += chunk
    })
    process.stdin.on('end', () => resolve(body))
    process.stdin.on('error', reject)
  })
}

function writeHtml(statusCode, title, message) {
  process.stdout.write(
    `Status: ${statusCode}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<!DOCTYPE html><html><head><title>${title}</title></head><body><h1>${title}</h1><p>${message}</p></body></html>`
  )
}

const query = new URLSearchParams(process.env.QUERY_STRING || '')

try {
  const runtimePaths = resolveCgiScriptRuntimePaths(
    process.env.SCRIPT_FILENAME || '',
    PRIVATE_SURVEY_RELATIVE_PATH,
    PRIVATE_ANSWERS_RELATIVE_PATH
  )
  const resolved = resolveStoredReporterSurveyFromPaths({
    surveyFilePath: runtimePaths.privateSurveyPath,
    answerDirectoryPath: runtimePaths.privateAnswersDir
  })
  const statistics = buildReporterStatistics(resolved.survey, resolved.validatedAnswerFiles, {
    groupBy: query.getAll('groupBy'),
    ...(query.get('recipientCount')
      ? { recipientCount: Number(query.get('recipientCount')) }
      : {})
  })
  const html = renderReporterHtmlPage({
    surveyName: runtimePaths.surveyName,
    survey: resolved.survey,
    statistics
  })

  process.stdout.write(`Status: 200\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${html}`)
} catch (error) {
  writeHtml(400, 'Reporter error', error instanceof Error ? error.message : String(error))
}
