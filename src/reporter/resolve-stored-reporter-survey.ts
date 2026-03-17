import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { parseSurvey, type Survey } from '../schema/survey'

import { getReporterRuntimePaths } from './runtime-paths'

export function resolveStoredReporterSurvey(
  surveyName: string,
  effectiveHomeDirectory: string
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
