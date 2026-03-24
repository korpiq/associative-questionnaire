#!/usr/local/bin/node --experimental-specifier-resolution=node

import { basename, dirname, resolve } from 'node:path'
import { renderSaverCgiResponse } from '../cgi/render-saver-cgi-response'
import { resolveRespondentCookie } from '../cgi/respondent-cookie'
import { saveSurveyAnswerSubmission } from '../cgi/save-survey-answer-submission'
const PRIVATE_ANSWERS_RELATIVE_PATH = '__PRIVATE_ANSWERS_RELATIVE_PATH__'
const DEFAULT_OK_URL = '__DEFAULT_OK_URL__'
const DEFAULT_FAIL_URL = '__DEFAULT_FAIL_URL__'

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
    const scriptFilename = process.env.SCRIPT_FILENAME || ''
    if (!scriptFilename) {
      throw new Error('Missing SCRIPT_FILENAME')
    }

    const scriptDirectory = dirname(scriptFilename)
    const requestBody = await readRequestBody()
    const respondent = resolveRespondentCookie(process.env.HTTP_COOKIE)

    saveSurveyAnswerSubmission({
      surveyName: basename(scriptDirectory),
      requestBody,
      respondentId: respondent.respondentId,
      effectiveHomeDirectory: '',
      surveyAnswersDirectory: resolve(scriptDirectory, PRIVATE_ANSWERS_RELATIVE_PATH)
    })

    writeResponse(
      renderSaverCgiResponse({
        success: true,
        ok: toOptional(query.get('ok')) || DEFAULT_OK_URL,
        setCookieHeader: respondent.setCookieHeader
      })
    )
  } catch (error) {
    writeResponse(
      renderSaverCgiResponse({
        success: false,
        message: error instanceof Error ? error.message : String(error),
        fail: toOptional(query.get('fail')) || DEFAULT_FAIL_URL
      })
    )
  }
}

main()
