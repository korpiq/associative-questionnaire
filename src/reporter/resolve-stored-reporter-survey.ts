import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { parseSurvey, type Survey } from '../schema/survey'

import { deriveProtectedSurveyAccessHash } from './derive-protected-survey-access-hash'
import { getReporterRuntimePaths } from './runtime-paths'

export function resolveStoredReporterSurvey(
  surveyName: string,
  effectiveHomeDirectory: string,
  access?: {
    protectionSecret?: string
    protectionHash?: string
  }
): {
  survey: Survey
  storedSurveyFilePath: string
  answerDirectoryPath: string
  answerFilePaths: string[]
} {
  const { surveysRoot, answersRoot } = getReporterRuntimePaths(effectiveHomeDirectory)
  const storedSurveyFilePath = join(surveysRoot, `${surveyName}.json`)
  const answerDirectoryPath = join(answersRoot, surveyName)
  const survey = parseSurvey(JSON.parse(readFileSync(storedSurveyFilePath, 'utf8')))

  if (survey.protected) {
    const expectedHash =
      access?.protectionSecret !== undefined
        ? deriveProtectedSurveyAccessHash(surveyName, access.protectionSecret)
        : ''

    if (!access?.protectionHash || access.protectionHash !== expectedHash) {
      throw new Error('Protected survey report requires a valid hash')
    }
  }

  const answerFilePaths = existsSync(answerDirectoryPath)
    ? readdirSync(answerDirectoryPath).map((filename) => join(answerDirectoryPath, filename))
    : []

  return {
    survey,
    storedSurveyFilePath,
    answerDirectoryPath,
    answerFilePaths
  }
}
