import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { parseAnswerFile, parseSurvey, type AnswerFile, type Survey } from '../schema/survey'

import { getReporterRuntimePaths, getReporterRuntimePathsFromDataDir } from './runtime-paths'

export function resolveStoredReporterSurvey(
  surveyName: string,
  effectiveHomeDirectory: string,
  access?: {
    dataDir?: string
  }
): {
  survey: Survey
  storedSurveyFilePath: string
  answerDirectoryPath: string
  answerFilePaths: string[]
  validatedAnswerFiles: AnswerFile[]
} {
  const { surveysRoot, answersRoot } = access?.dataDir
    ? getReporterRuntimePathsFromDataDir(access.dataDir)
    : getReporterRuntimePaths(effectiveHomeDirectory)
  const storedSurveyFilePath = join(surveysRoot, `${surveyName}.json`)
  const answerDirectoryPath = join(answersRoot, surveyName)
  const survey = parseSurvey(JSON.parse(readFileSync(storedSurveyFilePath, 'utf8')))

  const answerFilePaths = existsSync(answerDirectoryPath)
    ? readdirSync(answerDirectoryPath).map((filename) => join(answerDirectoryPath, filename))
    : []
  const validatedAnswerFiles = answerFilePaths.map((answerFilePath) =>
    parseAnswerFile(JSON.parse(readFileSync(answerFilePath, 'utf8')))
  )

  return {
    survey,
    storedSurveyFilePath,
    answerDirectoryPath,
    answerFilePaths,
    validatedAnswerFiles
  }
}
