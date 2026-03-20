import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, extname, join } from 'node:path'

import { parseSurvey } from '../schema/survey'

import { ensureReporterSurveyStorage, ensureReporterSurveyStorageAtRoot } from './runtime-paths'

function deriveStoredSurveyName(uploadedFilename: string): string {
  const filename = basename(uploadedFilename)
  const extension = extname(filename)

  return extension ? filename.slice(0, -extension.length) : filename
}

export function storeUploadedReporterSurvey(input: {
  uploadedFilename: string
  uploadedJson: string
  effectiveHomeDirectory: string
  surveysDataDir?: string
}): {
  surveyName: string
  storedSurveyFilePath: string
} {
  const surveyName = deriveStoredSurveyName(input.uploadedFilename)
  parseSurvey(JSON.parse(input.uploadedJson))

  const { surveysRoot } = input.surveysDataDir
    ? ensureReporterSurveyStorageAtRoot(input.surveysDataDir)
    : ensureReporterSurveyStorage(input.effectiveHomeDirectory)
  const storedSurveyFilePath = join(surveysRoot, `${surveyName}.json`)

  writeFileSync(storedSurveyFilePath, input.uploadedJson)

  return {
    surveyName,
    storedSurveyFilePath
  }
}
