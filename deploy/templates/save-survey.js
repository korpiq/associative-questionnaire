#!/usr/local/bin/node --experimental-specifier-resolution=node

import {
  renderSaverCgiResponse,
  resolveStoredReporterSurvey,
  saveSurveyAnswerSubmission
} from '/opt/associative-survey/app/deploy/generated/runtime/runtime-cgi.js'

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
const effectiveHomeDirectory = process.env.HOME || '/home/app'

try {
  if (!surveyName) {
    throw new Error('Missing surveyName')
  }

  const requestBody = await readRequestBody()
  const { survey } = resolveStoredReporterSurvey(surveyName, effectiveHomeDirectory, {
    protectionSecret: undefined,
    protectionHash: undefined
  })

  saveSurveyAnswerSubmission({
    survey,
    surveyName,
    requestBody,
    headers: {
      REMOTE_ADDR: process.env.REMOTE_ADDR,
      HTTP_USER_AGENT: process.env.HTTP_USER_AGENT,
      HTTP_ACCEPT_LANGUAGE: process.env.HTTP_ACCEPT_LANGUAGE
    },
    effectiveHomeDirectory
  })

  writeResponse(
    renderSaverCgiResponse({
      success: true,
      ok: toOptional(query.get('ok')),
      css: toOptional(query.get('css'))
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
