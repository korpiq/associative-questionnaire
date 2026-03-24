import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { ensureSurveyAnswerStorage, ensureSurveyAnswerStorageAtRoot } from './ensure-survey-answer-storage'

export function saveSurveyAnswerSubmission(input: {
  surveyName: string
  requestBody: string
  respondentId: string
  effectiveHomeDirectory: string
  answersDataDir?: string
  surveyAnswersDirectory?: string
}): {
  savedAnswerFilePath: string
} {
  const respondentFilename = `${input.respondentId}.json`
  const surveyAnswersDirectory =
    input.surveyAnswersDirectory ??
    (input.answersDataDir
      ? ensureSurveyAnswerStorageAtRoot(input.surveyName, input.answersDataDir).surveyAnswersDirectory
      : ensureSurveyAnswerStorage(input.surveyName, input.effectiveHomeDirectory)
          .surveyAnswersDirectory)
  mkdirSync(dirname(join(surveyAnswersDirectory, respondentFilename)), { recursive: true })
  const savedAnswerFilePath = join(surveyAnswersDirectory, respondentFilename)

  writeFileSync(savedAnswerFilePath, JSON.stringify({ requestBody: input.requestBody }))

  return {
    savedAnswerFilePath
  }
}
