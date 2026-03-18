import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

export function getReporterRuntimePathsFromDataDir(dataDir: string): {
  runtimeRoot: string
  surveysRoot: string
  answersRoot: string
} {
  return {
    runtimeRoot: dataDir,
    surveysRoot: join(dataDir, 'surveys'),
    answersRoot: join(dataDir, 'answers')
  }
}

export function getReporterRuntimePaths(effectiveHomeDirectory: string): {
  runtimeRoot: string
  surveysRoot: string
  answersRoot: string
} {
  const runtimeRoot = join(effectiveHomeDirectory, '.local', 'share', 'associative-survey')

  return getReporterRuntimePathsFromDataDir(runtimeRoot)
}

export function ensureReporterSurveyStorageAtRoot(surveysRoot: string): {
  surveysRoot: string
} {
  mkdirSync(surveysRoot, { recursive: true })

  return {
    surveysRoot
  }
}

export function ensureReporterSurveyStorage(effectiveHomeDirectory: string): {
  surveysRoot: string
} {
  const { surveysRoot } = getReporterRuntimePaths(effectiveHomeDirectory)

  return ensureReporterSurveyStorageAtRoot(surveysRoot)
}
