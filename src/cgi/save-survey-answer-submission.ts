import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Survey } from '../schema/survey'

import { deriveRespondentAnswerFilename } from './derive-respondent-answer-filename'
import { ensureSurveyAnswerStorage } from './ensure-survey-answer-storage'
import { normalizeSurveyAnswerRequestBody } from './normalize-survey-answer-request-body'

type CgiRequestHeaders = Record<string, string | undefined>

export function saveSurveyAnswerSubmission(input: {
  survey: Survey
  surveyName: string
  requestBody: string
  headers: CgiRequestHeaders
  effectiveHomeDirectory: string
  deploymentSalt?: string
}): {
  savedAnswerFilePath: string
} {
  const answerFile = normalizeSurveyAnswerRequestBody(input.survey, input.requestBody)
  const respondentFilename = deriveRespondentAnswerFilename(input.headers, input.deploymentSalt)
  const { surveyAnswersDirectory } = ensureSurveyAnswerStorage(
    input.surveyName,
    input.effectiveHomeDirectory
  )
  const savedAnswerFilePath = join(surveyAnswersDirectory, respondentFilename)

  writeFileSync(savedAnswerFilePath, JSON.stringify(answerFile))

  return {
    savedAnswerFilePath
  }
}
