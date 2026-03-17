import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

export function getReporterRuntimePaths(effectiveHomeDirectory: string): {
  runtimeRoot: string
  surveysRoot: string
  answersRoot: string
} {
  const runtimeRoot = join(effectiveHomeDirectory, '.local', 'share', 'associative-survey')

  return {
    runtimeRoot,
    surveysRoot: join(runtimeRoot, 'surveys'),
    answersRoot: join(runtimeRoot, 'answers')
  }
}

export function ensureReporterSurveyStorage(effectiveHomeDirectory: string): {
  surveysRoot: string
} {
  const { surveysRoot } = getReporterRuntimePaths(effectiveHomeDirectory)

  mkdirSync(surveysRoot, { recursive: true })

  return {
    surveysRoot
  }
}
