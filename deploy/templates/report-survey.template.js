#!/usr/local/bin/node --experimental-specifier-resolution=node

import {
  buildReporterStatistics,
  renderReporterHtmlPage,
  resolveStoredReporterSurvey,
  storeUploadedReporterSurvey
} from '/opt/associative-survey/app/deploy/generated/runtime/runtime-cgi.js'

const REPORTER_PROTECTION_SECRET = '__REPORTER_PROTECTION_SECRET__'

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
const method = process.env.REQUEST_METHOD || 'GET'
const effectiveHomeDirectory = process.env.HOME || '/home/app'

try {
  if (method === 'POST') {
    const uploadedFilename = query.get('filename')

    if (!uploadedFilename) {
      throw new Error('Missing filename')
    }

    const uploadedJson = await readRequestBody()
    const stored = storeUploadedReporterSurvey({
      uploadedFilename,
      uploadedJson,
      effectiveHomeDirectory,
      protectionSecret: REPORTER_PROTECTION_SECRET,
      protectionHash: toOptional(query.get('hash'))
    })

    writeHtml(200, 'Survey stored', `Stored ${stored.surveyName}`)
  } else {
    const surveyName = query.get('surveyName')

    if (!surveyName) {
      throw new Error('Missing surveyName')
    }

    const resolved = resolveStoredReporterSurvey(surveyName, effectiveHomeDirectory, {
      protectionSecret: REPORTER_PROTECTION_SECRET,
      protectionHash: toOptional(query.get('hash'))
    })
    const statistics = buildReporterStatistics(resolved.survey, resolved.validatedAnswerFiles, {
      groupBy: query.getAll('groupBy'),
      ...(query.get('recipientCount')
        ? { recipientCount: Number(query.get('recipientCount')) }
        : {})
    })
    const html = renderReporterHtmlPage({
      surveyName,
      survey: resolved.survey,
      statistics
    })

    process.stdout.write(`Status: 200\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${html}`)
  }
} catch (error) {
  writeHtml(400, 'Reporter error', error instanceof Error ? error.message : String(error))
}
