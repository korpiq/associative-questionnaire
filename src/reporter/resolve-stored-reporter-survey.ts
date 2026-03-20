import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { parseAnswerFile, parseSurvey, type AnswerFile, type Survey } from '../schema/survey'

import { getReporterRuntimePaths, getReporterRuntimePathsFromDataDir } from './runtime-paths'

export function resolveStoredReporterSurveyFromPaths(input: {
  surveyFilePath: string
  answerDirectoryPath: string
}): {
  survey: Survey
  storedSurveyFilePath: string
  answerDirectoryPath: string
  answerFilePaths: string[]
  validatedAnswerFiles: AnswerFile[]
} {
  const survey = parseSurvey(JSON.parse(readFileSync(input.surveyFilePath, 'utf8')))
  const answerFilePaths = existsSync(input.answerDirectoryPath)
    ? readdirSync(input.answerDirectoryPath).map((filename) => join(input.answerDirectoryPath, filename))
    : []
  const validatedAnswerFiles = answerFilePaths.map((answerFilePath) =>
    parseAnswerFile(JSON.parse(readFileSync(answerFilePath, 'utf8')))
  )

  return {
    survey,
    storedSurveyFilePath: input.surveyFilePath,
    answerDirectoryPath: input.answerDirectoryPath,
    answerFilePaths,
    validatedAnswerFiles
  }
}

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
  return resolveStoredReporterSurveyFromPaths({
    surveyFilePath: join(surveysRoot, `${surveyName}.json`),
    answerDirectoryPath: join(answersRoot, surveyName)
  })
}
