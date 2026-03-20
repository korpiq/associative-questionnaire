import { basename, dirname, resolve } from 'node:path'

export function resolveCgiScriptRuntimePaths(
  scriptFilename: string,
  privateSurveyRelativePath: string,
  privateAnswersRelativePath: string
): {
  scriptFilename: string
  scriptDirectory: string
  surveyName: string
  privateSurveyPath: string
  privateAnswersDir: string
} {
  if (!scriptFilename) {
    throw new Error('Missing SCRIPT_FILENAME')
  }

  const scriptDirectory = dirname(scriptFilename)

  return {
    scriptFilename,
    scriptDirectory,
    surveyName: basename(scriptDirectory),
    privateSurveyPath: resolve(scriptDirectory, privateSurveyRelativePath),
    privateAnswersDir: resolve(scriptDirectory, privateAnswersRelativePath)
  }
}
