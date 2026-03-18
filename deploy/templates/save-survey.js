#!/usr/local/bin/node --experimental-specifier-resolution=node

import {
  renderSaverCgiResponse,
  resolveStoredReporterSurvey,
  resolveRespondentCookie,
  saveSurveyAnswerSubmission
} from '/opt/associative-survey/app/deploy/generated/runtime/runtime-cgi.js'

const SURVEYS_DATA_DIR = '__SURVEYS_DATA_DIR__'
const ANSWERS_DATA_DIR = '__ANSWERS_DATA_DIR__'

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
const surveyName = query.get('surveyName') || ''

try {
  if (!surveyName) {
    throw new Error('Missing surveyName')
  }

  const requestBody = await readRequestBody()
  const { survey } = resolveStoredReporterSurvey(surveyName, '', {
    dataDir: SURVEYS_DATA_DIR.replace(/\/surveys$/, ''),
    protectionSecret: undefined,
    protectionHash: undefined
  })
  const respondent = resolveRespondentCookie(process.env.HTTP_COOKIE)

  saveSurveyAnswerSubmission({
    survey,
    surveyName,
    requestBody,
    respondentId: respondent.respondentId,
    effectiveHomeDirectory: '',
    answersDataDir: ANSWERS_DATA_DIR
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
