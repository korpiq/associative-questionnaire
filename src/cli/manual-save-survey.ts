import { resolve } from 'node:path'

import {
  deriveSurveyName,
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
  const resolvedSurveyName = surveyName ?? deriveSurveyName(surveyPath)
  const result = saveSurveyAnswerSubmission({
    surveyName: resolvedSurveyName,
    requestBody,
    respondentId: process.env.MANUAL_RESPONDENT_ID ?? '0123456789abcdef0123456789abcdef',
    effectiveHomeDirectory: resolve(effectiveHomeDirectory)
  })

  console.log(JSON.stringify(result, null, 2))
}

main()
