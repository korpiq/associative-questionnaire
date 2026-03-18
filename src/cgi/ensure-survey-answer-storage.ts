import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

export function ensureSurveyAnswerStorageAtRoot(surveyName: string, runtimeAnswersRoot: string): {
  runtimeAnswersRoot: string
  surveyAnswersDirectory: string
} {
  const surveyAnswersDirectory = join(runtimeAnswersRoot, surveyName)

  mkdirSync(surveyAnswersDirectory, { recursive: true })

  return {
    runtimeAnswersRoot,
    surveyAnswersDirectory
  }
}

export function ensureSurveyAnswerStorage(surveyName: string, effectiveHomeDirectory: string): {
  runtimeAnswersRoot: string
  surveyAnswersDirectory: string
} {
  const runtimeAnswersRoot = join(
    effectiveHomeDirectory,
    '.local',
    'share',
    'associative-survey',
    'answers'
  )
  return ensureSurveyAnswerStorageAtRoot(surveyName, runtimeAnswersRoot)
}
