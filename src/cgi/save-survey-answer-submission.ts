import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Survey } from '../schema/survey'

import { ensureSurveyAnswerStorage } from './ensure-survey-answer-storage'
import { normalizeSurveyAnswerRequestBody } from './normalize-survey-answer-request-body'

export function saveSurveyAnswerSubmission(input: {
  survey: Survey
  surveyName: string
  requestBody: string
  respondentId: string
  effectiveHomeDirectory: string
}): {
  savedAnswerFilePath: string
} {
  const answerFile = normalizeSurveyAnswerRequestBody(input.survey, input.requestBody)
  const respondentFilename = `${input.respondentId}.json`
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
