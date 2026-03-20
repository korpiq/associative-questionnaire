import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import type { Survey } from '../schema/survey'

import { ensureSurveyAnswerStorage, ensureSurveyAnswerStorageAtRoot } from './ensure-survey-answer-storage'
import { normalizeSurveyAnswerRequestBody } from './normalize-survey-answer-request-body'

export function saveSurveyAnswerSubmission(input: {
  survey: Survey
  surveyName: string
  requestBody: string
  respondentId: string
  effectiveHomeDirectory: string
  answersDataDir?: string
  surveyAnswersDirectory?: string
}): {
  savedAnswerFilePath: string
} {
  const answerFile = normalizeSurveyAnswerRequestBody(input.survey, input.requestBody)
  const respondentFilename = `${input.respondentId}.json`
  const surveyAnswersDirectory =
    input.surveyAnswersDirectory ??
    (input.answersDataDir
      ? ensureSurveyAnswerStorageAtRoot(input.surveyName, input.answersDataDir).surveyAnswersDirectory
      : ensureSurveyAnswerStorage(input.surveyName, input.effectiveHomeDirectory)
          .surveyAnswersDirectory)
  mkdirSync(dirname(join(surveyAnswersDirectory, respondentFilename)), { recursive: true })
  const savedAnswerFilePath = join(surveyAnswersDirectory, respondentFilename)

  writeFileSync(savedAnswerFilePath, JSON.stringify(answerFile))

  return {
    savedAnswerFilePath
  }
}
