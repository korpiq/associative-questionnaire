import { writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'

import { deriveSurveyName } from '../generator/generate-survey-html'
import { parseSurvey } from '../schema/survey'

import { ensureReporterSurveyStorage } from './runtime-paths'

export function storeUploadedReporterSurvey(input: {
  uploadedFilename: string
  uploadedJson: string
  effectiveHomeDirectory: string
}): {
  surveyName: string
  storedSurveyFilePath: string
} {
  const surveyName = deriveSurveyName(basename(input.uploadedFilename))
  parseSurvey(JSON.parse(input.uploadedJson))

  const { surveysRoot } = ensureReporterSurveyStorage(input.effectiveHomeDirectory)
  const storedSurveyFilePath = join(surveysRoot, `${surveyName}.json`)

  writeFileSync(storedSurveyFilePath, input.uploadedJson)

  return {
    surveyName,
    storedSurveyFilePath
  }
}
