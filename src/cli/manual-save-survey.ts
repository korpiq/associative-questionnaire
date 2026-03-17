import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  deriveSurveyName,
  parseSurvey,
  saveSurveyAnswerSubmission
} from '../index'

function readArguments(): {
  surveyPath: string
  requestBody: string
  effectiveHomeDirectory: string
  surveyName?: string
} {
  const [surveyPath, requestBody, effectiveHomeDirectory, surveyName] = process.argv.slice(2)

  if (!surveyPath || !requestBody || !effectiveHomeDirectory) {
    throw new Error(
      'Usage: npm run manual:save -- <survey.json> <request-body> <effective-home-directory> [survey-name]'
    )
  }

  return {
    surveyPath,
    requestBody,
    effectiveHomeDirectory,
    ...(surveyName ? { surveyName } : {})
  }
}

function main(): void {
  const { surveyPath, requestBody, effectiveHomeDirectory, surveyName } = readArguments()
  const survey = parseSurvey(JSON.parse(readFileSync(resolve(surveyPath), 'utf8')))
  const resolvedSurveyName = surveyName ?? deriveSurveyName(surveyPath)
  const result = saveSurveyAnswerSubmission({
    survey,
    surveyName: resolvedSurveyName,
    requestBody,
    headers: {
      REMOTE_ADDR: process.env.MANUAL_REMOTE_ADDR ?? '203.0.113.10',
      HTTP_USER_AGENT: process.env.MANUAL_USER_AGENT ?? 'ManualSurveySaver/1.0',
      HTTP_ACCEPT_LANGUAGE: process.env.MANUAL_ACCEPT_LANGUAGE ?? 'en-US,en;q=0.9'
    },
    effectiveHomeDirectory: resolve(effectiveHomeDirectory),
    ...(process.env.MANUAL_DEPLOYMENT_SALT
      ? { deploymentSalt: process.env.MANUAL_DEPLOYMENT_SALT }
      : {})
  })

  console.log(JSON.stringify(result, null, 2))
}

main()
