#!/usr/local/bin/node --experimental-specifier-resolution=node

import { readFileSync } from 'node:fs'
import {
  renderSaverCgiResponse
} from '../cgi/render-saver-cgi-response'
import { resolveRespondentCookie } from '../cgi/respondent-cookie'
import { resolveCgiScriptRuntimePaths } from '../cgi/resolve-cgi-script-runtime-paths'
import { saveSurveyAnswerSubmission } from '../cgi/save-survey-answer-submission'
import { parseSurvey } from '../schema/survey'

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

function writeResponse(response) {
  const lines = [`Status: ${response.statusCode}`]

  Object.entries(response.headers).forEach(([name, value]) => {
    lines.push(`${name}: ${value}`)
  })

  process.stdout.write(`${lines.join('\r\n')}\r\n\r\n${response.body}`)
}

const query = new URLSearchParams(process.env.QUERY_STRING || '')

async function main() {
  try {
    const runtimePaths = resolveCgiScriptRuntimePaths(
      process.env.SCRIPT_FILENAME || '',
      PRIVATE_SURVEY_RELATIVE_PATH,
      PRIVATE_ANSWERS_RELATIVE_PATH
    )
    const requestBody = await readRequestBody()
    const survey = parseSurvey(JSON.parse(readFileSync(runtimePaths.privateSurveyPath, 'utf8')))
    const respondent = resolveRespondentCookie(process.env.HTTP_COOKIE)

    saveSurveyAnswerSubmission({
      survey,
      surveyName: runtimePaths.surveyName,
      requestBody,
      respondentId: respondent.respondentId,
      effectiveHomeDirectory: '',
      surveyAnswersDirectory: runtimePaths.privateAnswersDir
    })

    writeResponse(
      renderSaverCgiResponse({
        success: true,
        ok: toOptional(query.get('ok')),
        css: toOptional(query.get('css')),
        setCookieHeader: respondent.setCookieHeader
      })
    )
  } catch (error) {
    writeResponse(
      renderSaverCgiResponse({
        success: false,
        message: error instanceof Error ? error.message : String(error),
        fail: toOptional(query.get('fail')),
        css: toOptional(query.get('css'))
      })
    )
  }
}

main()
