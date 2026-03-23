import { existsSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'

function readRequiredArgument(argv: string[], usage: string): string {
  const value = argv[2]

  if (!value) {
    throw new Error(usage)
  }

  return value
}

function ensurePathIsInside(parentDirectory: string, path: string, message: string): string {
  const relativePath = relative(parentDirectory, path)

  if (
    !relativePath ||
    relativePath.startsWith('..') ||
    relativePath.includes(`${sep}..${sep}`) ||
    relativePath === '..'
  ) {
    throw new Error(message)
  }

  return relativePath
}

export function readSurveyDirectoryArgument(argv: string[], workspaceDirectory: string): {
  surveyDirectory: string
  surveyName: string
  targetDirectory: string
  targetName: string
} {
  const inputPath = readRequiredArgument(argv, 'Usage: npm run package:survey -- <survey-folder>')
  const surveyDirectory = resolve(workspaceDirectory, inputPath)
  const targetsRoot = resolve(workspaceDirectory, 'targets')
  const relativeSurveyPath = ensurePathIsInside(
    targetsRoot,
    surveyDirectory,
    'Survey folder must be inside targets/'
  )
  const segments = relativeSurveyPath.split(sep)

  if (segments.length !== 3 || segments[1] !== 'surveys') {
    throw new Error('Survey folder must point to targets/<target-name>/surveys/<survey-name>')
  }

  const targetName = segments[0]
  const surveyName = segments[2]

  if (!targetName || !surveyName) {
    throw new Error('Survey folder must point to targets/<target-name>/surveys/<survey-name>')
  }

  if (!existsSync(resolve(surveyDirectory, 'survey.json'))) {
    throw new Error(`Survey folder must contain survey.json: ${inputPath}`)
  }

  if (!existsSync(resolve(surveyDirectory, 'template.html'))) {
    throw new Error(`Survey folder must contain template.html: ${inputPath}`)
  }

  return {
    surveyDirectory,
    surveyName,
    targetDirectory: dirname(dirname(surveyDirectory)),
    targetName
  }
}
