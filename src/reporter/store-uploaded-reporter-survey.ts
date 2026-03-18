import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, extname, join } from 'node:path'

import { parseSurvey } from '../schema/survey'

import { deriveProtectedSurveyAccessHash } from './derive-protected-survey-access-hash'
import { ensureReporterSurveyStorage, ensureReporterSurveyStorageAtRoot } from './runtime-paths'

function deriveStoredSurveyName(uploadedFilename: string): string {
  const filename = basename(uploadedFilename)
  const extension = extname(filename)

  return extension ? filename.slice(0, -extension.length) : filename
}

function assertProtectedSurveyUploadAllowed(input: {
  surveyName: string
  storedSurveyFilePath: string
  protectionSecret?: string
  protectionHash?: string
}): void {
  if (!existsSync(input.storedSurveyFilePath)) {
    return
  }

  const existingSurvey = parseSurvey(JSON.parse(readFileSync(input.storedSurveyFilePath, 'utf8')))

  if (!existingSurvey.protected) {
    return
  }

  const expectedHash =
    input.protectionSecret !== undefined
      ? deriveProtectedSurveyAccessHash(input.surveyName, input.protectionSecret)
      : ''

  if (!input.protectionHash || input.protectionHash !== expectedHash) {
    throw new Error('Protected survey upload requires a valid hash')
  }
}

export function storeUploadedReporterSurvey(input: {
  uploadedFilename: string
  uploadedJson: string
  effectiveHomeDirectory: string
  surveysDataDir?: string
  protectionSecret?: string
  protectionHash?: string
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

  assertProtectedSurveyUploadAllowed({
    surveyName,
    storedSurveyFilePath,
    ...(input.protectionSecret ? { protectionSecret: input.protectionSecret } : {}),
    ...(input.protectionHash ? { protectionHash: input.protectionHash } : {})
  })

  writeFileSync(storedSurveyFilePath, input.uploadedJson)

  return {
    surveyName,
    storedSurveyFilePath
  }
}
