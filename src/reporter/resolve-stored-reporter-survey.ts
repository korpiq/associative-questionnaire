import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { parseAnswerFile, parseSurvey, type AnswerFile, type Survey } from '../schema/survey'
import { normalizeSurveyAnswerRequestBody } from '../cgi/normalize-survey-answer-request-body'

import { getReporterRuntimePaths, getReporterRuntimePathsFromDataDir } from './runtime-paths'

function resolveStoredAnswerFile(survey: Survey, answerFilePath: string): AnswerFile {
  const storedAnswer = JSON.parse(readFileSync(answerFilePath, 'utf8')) as unknown

  if (
    typeof storedAnswer === 'object' &&
    storedAnswer !== null &&
    'requestBody' in storedAnswer &&
    typeof storedAnswer.requestBody === 'string'
  ) {
    return normalizeSurveyAnswerRequestBody(survey, storedAnswer.requestBody)
  }

  return parseAnswerFile(storedAnswer)
}

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
    resolveStoredAnswerFile(survey, answerFilePath)
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
